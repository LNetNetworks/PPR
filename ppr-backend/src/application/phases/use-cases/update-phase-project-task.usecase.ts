import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectTask } from "../../../domain/phases/phase-project-task.entity";
import { UpdatePhaseProjectTaskInput } from "../../../application/phases/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { TaskRepository } from "../../../domain/tasks/task.repository";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { PhaseProjectWorkflow } from "../../../domain/phases/services/phase-project-workflow";
import { PhaseProjectTaskStatus } from "../../../domain/phases/phase-project-task-status.enum";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { PhaseProject } from "../../../domain/phases/phase-project.entity";
import { ensureProjectHasMinimumRequiredPhases } from "../../../domain/phases/rules/phase-project.rules";

@Injectable()
export class UpdatePhaseProjectTaskUseCase {
  private readonly workflow = new PhaseProjectWorkflow();

  constructor(
    private readonly repo: PhaseProjectTaskRepository,
    private readonly seq: SequenceService,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoTask: TaskRepository,
    private readonly repoPhase: PhaseRepository,
    private readonly repoProject: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    phaseProjectId: string,
    taskId: string,
    input: UpdatePhaseProjectTaskInput,
  ): Promise<PhaseProjectTask> {
    const project = await this.repoProject.findById(projectId);

    if (!project) {
      throw new NotFoundException(
        `Project with id: "${projectId}" not found`,
      );
    }

    const phaseProject = await this.repoPhaseProject.findById(phaseProjectId);

    if (!phaseProject) {
      throw new NotFoundException(
        `Phase Project with id: "${phaseProjectId}" not found`,
      );
    }

    if (phaseProject.id_project !== projectId) {
      throw new BadRequestException(
        `Phase Project with id: "${phaseProjectId}" does not belong to project "${projectId}"`,
      );
    }

    const task = await this.repoTask.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with id: "${taskId}" not found`);
    }

    const currentPhaseProjectTask = await this.repo.findByPhaseProjectTask(
      phaseProjectId,
      taskId,
    );

    if (!currentPhaseProjectTask) {
      throw new NotFoundException(
        `Task with Id ${input.id_task} no exist in phase of project`,
      );
    }

    if (input.status_task === PhaseProjectTaskStatus.IN_PROGRESS) {
      const projectPhases = await this.repoPhaseProject.findAll({
        prjId: projectId,
      });

      try {
        ensureProjectHasMinimumRequiredPhases(projectPhases);
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error
            ? error.message
            : "Invalid project phase structure",
        );
      }
    }

    this.ensureTaskStatusTransitionIsAllowed(
      currentPhaseProjectTask,
      input.status_task,
    );

    const update_phase_project_task = new PhaseProjectTask(
      currentPhaseProjectTask.id_phase_project_task,
      phaseProjectId,
      input.id_task,
      input.status_task,
    );
    const savedTask = await this.repo.save(update_phase_project_task);
    const phaseTasks = await this.repo.findByPhaseProjectId(phaseProjectId);
    await this.tryMovePhaseToInProgress(phaseProject, phaseTasks);
    await this.tryMovePhaseToCanceled(phaseProject, phaseTasks);

    return savedTask;
  }

  private ensureTaskStatusTransitionIsAllowed(
    currentTask: PhaseProjectTask,
    nextStatus: PhaseProjectTaskStatus,
  ): void {
    switch (nextStatus) {
      case PhaseProjectTaskStatus.IN_PROGRESS:
        if (!this.workflow.canMoveTaskToInProgress(currentTask)) {
          throw new BadRequestException(
            `Task "${currentTask.id_phase_project_task}" cannot move from "${currentTask.status_task}" to "${nextStatus}"`,
          );
        }
        return;

      case PhaseProjectTaskStatus.CLOSED:
        if (!this.workflow.canMoveTaskToClosed(currentTask)) {
          throw new BadRequestException(
            `Task "${currentTask.id_phase_project_task}" cannot move from "${currentTask.status_task}" to "${nextStatus}"`,
          );
        }
        return;

      case PhaseProjectTaskStatus.CANCELED:
        if (!this.workflow.canMoveTaskToCanceled(currentTask)) {
          throw new BadRequestException(
            `Task "${currentTask.id_phase_project_task}" cannot move from "${currentTask.status_task}" to "${nextStatus}"`,
          );
        }
        return;

      case PhaseProjectTaskStatus.PENDING:
        throw new BadRequestException(
          `Task status cannot be changed back to pending`,
        );

      default:
        throw new BadRequestException(
          `Unsupported task status transition to "${nextStatus}"`,
        );
    }
  }

  private async tryMovePhaseToInProgress(
    phaseProject: PhaseProject,
    tasks: PhaseProjectTask[],
  ): Promise<void> {
    if (!this.workflow.canMovePhaseToInProgress(phaseProject, tasks)) {
      return;
    }

    phaseProject.status = PhaseProjectStatus.IN_PROGRESS;
    await this.repoPhaseProject.save(phaseProject);
  }

  private async tryMovePhaseToCanceled(
    phaseProject: PhaseProject,
    tasks: PhaseProjectTask[],
  ): Promise<void> {
    if (
      !this.workflow.canMovePhaseToCanceled({
        currentPhase: phaseProject,
        tasks,
        manual: false,
      })
    ) {
      return;
    }

    phaseProject.status = PhaseProjectStatus.CANCELED;
    await this.repoPhaseProject.save(phaseProject);
  }
}
