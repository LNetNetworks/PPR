import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
import { UpdatePhaseProjectInput } from "../../../application/phases/use-cases/types";
import { PhaseProject } from "../../../domain/phases/phase-project.entity";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectWorkflow } from "../../../domain/phases/services/phase-project-workflow";
import { ensureValidPhaseAutoCloseConfiguration } from "../../../domain/phases/rules/phase-project-config.rules";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { UserRole } from "../../../domain/users/user-role.enum";
import { EnsurePendingAuditRevisionPhaseService } from "../../../application/phases/use-cases/service/ensure-pending-audit-revision-phase.service";
import { ensureProjectHasMinimumRequiredPhases } from "../../../domain/phases/rules/phase-project.rules";
import { ensurePhaseProjectHasAtLeastOneTask } from "../../../domain/phases/rules/phase-project-workflow.rules";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";

@Injectable()
export class UpdatePhaseProjectUseCase {
  private readonly workflow = new PhaseProjectWorkflow();

  constructor(
    private readonly repo: PhaseProjectRepository,
    private readonly prjRepo: ProjectRepository,
    private readonly phaseRepo: PhaseRepository,
    private readonly phaseProjectTaskRepo: PhaseProjectTaskRepository,
    private readonly repoProjectUser: ProjectUserRepository,
    private readonly ensureAuditory: EnsurePendingAuditRevisionPhaseService,
    private readonly repoContribution: ContributionRepository,
    private readonly repoEvidence: EvidenceRepository,
    private readonly repoAudit: AuditRevisionRepository,
  ) {}

  async execute(
    projectId: string,
    phaseId: string,
    input: UpdatePhaseProjectInput,
  ): Promise<PhaseProject> {
    const phase = await this.phaseRepo.findById(phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase with id: "${phaseId}" not found`);
    }

    const project = await this.prjRepo.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with id: "${projectId}" not found`);
    }

    const listPhaseProject = await this.repo.findAll({
      prjId: project.id_project,
    });

    const currentPhaseProject = listPhaseProject.find(
      (item) => item.id_phase === phaseId,
    );

    if (!currentPhaseProject) {
      throw new BadRequestException(`This phase is new in the project`);
    }

    const otherPhases = listPhaseProject.filter(
      (item) => item.id_phase_project !== currentPhaseProject.id_phase_project,
    );

    const totalWeight =
      otherPhases.reduce((accumulator, stage) => {
        return accumulator + stage.stage_weight;
      }, 0) + input.stage_weight;

    if (totalWeight > 100) {
      throw new BadRequestException(
        `The total project weight cannot exceed 100%. Please adjust the stage_weight.`,
      );
    }

    const phaseProjectToUpdate = new PhaseProject(
      currentPhaseProject.id_phase_project,
      phaseId,
      project.id_project,
      input.require_evidence,
      input.status,
      input.order,
      input.stage_weight,
      input.contribution_required,
      input.contribution_received,
      new Date(input.date_start),
      new Date(input.date_end),
      input.type,
      input.require_auditory,
      input.require_contribution,
      input.close_auditory,
      input.close_contribution,
      input.close_evidence,
      input.description,
    );

    if (input.require_auditory) {
      const user = await this.repoProjectUser.findByProjectUserRole(
        projectId,
        UserRole.VERIFIER,
      );

      if (!user || user.length > 1) {
        throw new BadRequestException(
          `The project hasn't verifier or multiple`,
        );
      }
      await this.ensureAuditory.execute({
        id_project: projectId,
        id_phase_project: currentPhaseProject.id_phase_project,
        id_user: user[0].id_user,
      });
    }

    ensureValidPhaseAutoCloseConfiguration(phaseProjectToUpdate);

    await this.ensurePhaseStatusTransitionIsAllowed({
      currentPhaseProject,
      nextPhaseProject: phaseProjectToUpdate,
      projectPhases: listPhaseProject,
    });
    return this.repo.save(phaseProjectToUpdate);
  }

  private async ensurePhaseStatusTransitionIsAllowed(params: {
    currentPhaseProject: PhaseProject;
    nextPhaseProject: PhaseProject;
    projectPhases: PhaseProject[];
  }): Promise<void> {
    const { currentPhaseProject, nextPhaseProject, projectPhases } = params;

    if (currentPhaseProject.status === nextPhaseProject.status) {
      return;
    }

    const tasks = await this.phaseProjectTaskRepo.findByPhaseProjectId(
      currentPhaseProject.id_phase_project,
    );

    switch (nextPhaseProject.status) {
      case PhaseProjectStatus.IN_PROGRESS: {
        ensureProjectHasMinimumRequiredPhases(projectPhases);
        ensurePhaseProjectHasAtLeastOneTask(tasks);

        const result = this.workflow.canMovePhaseToInProgress(
          currentPhaseProject,
          tasks,
        );

        if (!result.allowed) {
          throw new BadRequestException(
            `Phase project "${currentPhaseProject.id_phase_project}" cannot move to "${nextPhaseProject.status}". Reason: ${result.reason}`,
          );
        }
        return;
      }
      case PhaseProjectStatus.CANCELED:
        if (
          !this.workflow.canMovePhaseToCanceled({
            currentPhase: currentPhaseProject,
            tasks,
            manual: true,
            cancellationReason: nextPhaseProject.description,
          })
        ) {
          throw new BadRequestException(
            `Phase project "${currentPhaseProject.id_phase_project}" cannot move from "${currentPhaseProject.status}" to "${nextPhaseProject.status}"`,
          );
        }
        return;

      case PhaseProjectStatus.COMPLETED: {
        const evidences = await this.repoEvidence.findByPhaseProjectId(
          currentPhaseProject.id_phase_project,
        );

        const audits = await this.repoAudit.findByPhaseProject(
          currentPhaseProject.id_phase_project,
        );

        const contributions = await this.repoContribution.findByPhaseProjectId(
          currentPhaseProject.id_phase_project,
        );

        if (
          !this.workflow.canMovePhaseToCompleted({
            phase: currentPhaseProject,
            tasks,
            manual: true,
            hasEvidenceRegistered: evidences.length > 0,
            hasAuditRegisteredAndFinalized: audits.some(
              (audit) => audit.status === AuditStatus.FINALIZED,
            ),
            hasContributionRegistered: contributions.length > 0,
          })
        ) {
          throw new BadRequestException(
            `Phase project "${currentPhaseProject.id_phase_project}" cannot move from "${currentPhaseProject.status}" to "${nextPhaseProject.status}"`,
          );
        }
        return;
      }

      case PhaseProjectStatus.CLOSED: {
        if (
          !this.workflow.canMovePhaseToClosed({
            phase: currentPhaseProject,
            tasks,
            previousPhases: projectPhases,
          })
        ) {
          throw new BadRequestException(
            `Phase project "${currentPhaseProject.id_phase_project}" cannot move from "${currentPhaseProject.status}" to "${nextPhaseProject.status}"`,
          );
        }
        return;
      }

      case PhaseProjectStatus.PENDING:
        throw new BadRequestException(
          `Phase project status cannot be changed back to pending`,
        );

      default:
        throw new BadRequestException(
          `Unsupported phase project status transition to "${nextPhaseProject.status}"`,
        );
    }
  }
}
