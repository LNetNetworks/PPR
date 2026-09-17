import { Injectable, BadRequestException } from "@nestjs/common";
import { PokService } from "../../../../infrastructure/integrations/pok/pok.service";
import { EnqueueJobUseCase } from "../../../queue/use-cases/enqueue-job.usecase";
import { EnqueueTasksUseCase } from "../../../queue/use-cases/enqueue-tasks.usecase";
import { PhaseProjectRepository } from "../../../../domain/phases/phase-project.repository";
import { ProjectRepository } from "../../../../domain/projects/project.repository";
import { ProjectStatus } from "../../../../domain/projects/project-status.enum";
@Injectable()
export class GetVcsAndEnqueueTitlesSyncUseCase {
  static readonly TASK_TYPE = "POK_TITLES_SYNC";
  static readonly MAX_VCS_TO_SYNC = 20;

  constructor(
    private readonly pok: PokService,
    private readonly enqueueJob: EnqueueJobUseCase,
    private readonly enqueueTasks: EnqueueTasksUseCase,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoProject: ProjectRepository,
  ) {}

  async execute(requestedBy: string, projectId: string, phaseId: string) {
    if (!projectId) {
      throw new BadRequestException(`The projectId of Project is empty `);
    }

    if (!phaseId) {
      throw new BadRequestException(`The phaseId of Project is empty`);
    }

    const phaseProject = await this.repoPhaseProject.findByPhase({
      phaseId,
      projectId,
    });

    if (!phaseProject) {
      throw new BadRequestException(
        `Phase with id ${phaseId}} not within of project ${projectId}`,
      );
    }

    const project = await this.repoProject.findById(projectId);
    if (!project) {
      throw new BadRequestException(`Project with id ${projectId} not found`);
    }
    if (project.status != ProjectStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Project must be 'In Progress' to perform this action.`,
      );
    }

    const response = await this.pok.getCredentialsByDate(
      project.date_start.toISOString(),
      project.date_end.toISOString(),
    );

    const vcs = response.data;
    if (!vcs) {
      throw new BadRequestException(`Credential is empty`);
    }
    const normalizedTasks = vcs
      .map((vc) => {
        const vcId = typeof vc?.id === "string" ? vc.id : null;
        if (!vcId) return null;
        const emailRaw = vc?.receiver?.email;
        const email =
          typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : null;
        if (!email || !email.includes("@")) return null;

        const name =
          typeof vc?.receiver?.name === "string"
            ? vc.receiver.name.trim()
            : null;

        const title =
          typeof vc?.credential?.title === "string"
            ? vc.credential.title.trim()
            : null;

        const emitter =
          typeof vc?.credential?.emitter === "string"
            ? vc.credential.emitter.trim()
            : null;

        const dedupeKey = `POK|TITLE|${projectId}-${phaseId}-${vcId}`;

        return {
          dedupeKey,
          payload: {
            requestedBy,
            source: "POK",
            projectId,
            phaseId,
            holder: { email, name },
            vc: { id: vcId, title, emitter },
            viewUrl: vc.viewUrl ?? null,
          },
        };
      })
      .filter(Boolean) as Array<{ dedupeKey: string; payload: any }>;

    const tasks = normalizedTasks.slice(
      0,
      GetVcsAndEnqueueTitlesSyncUseCase.MAX_VCS_TO_SYNC,
    );

    if (tasks.length === 0) {
      return { jobId: null, total: 0 };
    }

    const jobRes = await this.enqueueJob.execute({
      requestedBy: requestedBy,
      type: GetVcsAndEnqueueTitlesSyncUseCase.TASK_TYPE,
      total: tasks.length,
    });

    if (!jobRes) {
      throw new BadRequestException(`The Jobs could't create`);
    }

    await this.enqueueTasks.execute({
      jobId: jobRes.jobId,
      type: GetVcsAndEnqueueTitlesSyncUseCase.TASK_TYPE,
      tasks,
    });

    return {
      jobId: jobRes.jobId,
      total: tasks.length,
    };
  }
}
