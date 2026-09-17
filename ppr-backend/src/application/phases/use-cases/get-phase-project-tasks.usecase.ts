import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { TaskRepository } from "../../../domain/tasks/task.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";

export interface PhaseProjectTaskWithDetails {
  id_phase_project_task: string;
  id_phase_project: string;
  id_task: string;
  status_task: string;
  task: {
    id_task: string;
    name_task: string;
  } | null;
}

@Injectable()
export class GetPhaseProjectTasksUseCase {
  constructor(
    private readonly repoPhaseProjectTask: PhaseProjectTaskRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoTask: TaskRepository,
    private readonly repoProject: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    phaseProjectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<PhaseProjectTaskWithDetails[]> {
    const project = await this.repoProject.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with id: "${projectId}" not found`);
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

    const phaseProjectTasks =
      await this.repoPhaseProjectTask.findByPhaseProjectId(
        phaseProjectId,
        params,
      );

    const tasksWithDetails: PhaseProjectTaskWithDetails[] = await Promise.all(
      phaseProjectTasks.map(async (phaseProjectTask) => {
        const task = await this.repoTask.findById(phaseProjectTask.id_task);
        return {
          id_phase_project_task: phaseProjectTask.id_phase_project_task,
          id_phase_project: phaseProjectTask.id_phase_project,
          id_task: phaseProjectTask.id_task,
          status_task: phaseProjectTask.status_task,
          task: task
            ? {
                id_task: task.id_task,
                name_task: task.name_task,
              }
            : null,
        };
      }),
    );

    return tasksWithDetails;
  }
}
