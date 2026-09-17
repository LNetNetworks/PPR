import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectWorkflow } from "../../../domain/phases/services/phase-project-workflow";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import {
  ensureAuditCanBeFinalizedOnlyWhenPhaseCompleted,
  ensurePhaseProjectIsInProgressOrCompletedForAudit,
} from "../../../domain/phases/rules/phase-project-workflow.rules";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";
import { UpdateAuditRevisionDto } from "../dto/update-audit-revision.dto";

@Injectable()
export class UpdateAuditRevisionUseCase {
  private readonly workflow = new PhaseProjectWorkflow();

  constructor(
    private readonly repo: AuditRevisionRepository,
    private readonly repoProject: ProjectRepository,
    private readonly repoUser: UserRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoPhaseProjectTask: PhaseProjectTaskRepository,
    private readonly repoEvidence: EvidenceRepository,
    private readonly repoContribution: ContributionRepository,
  ) {}

  async execute(id: string, input: UpdateAuditRevisionDto) {
    const audit = await this.repo.findById(id);

    if (!audit) {
      throw new NotFoundException(`AuditRevision with id: "${id}" not found`);
    }

    const project = await this.repoProject.findById(input.id_project);
    if (!project) {
      throw new NotFoundException(
        `Project with id: "${input.id_project}" not found`,
      );
    }

    const user = await this.repoUser.findById(input.id_user);
    if (!user) {
      throw new NotFoundException(`User with id: "${input.id_user}" not found`);
    }

    const phaseProject = await this.repoPhaseProject.findById(
      input.id_phase_project,
    );
    if (!phaseProject) {
      throw new NotFoundException(
        `Phase Project with id: "${input.id_phase_project}" not found`,
      );
    }

    if (phaseProject.id_project !== input.id_project) {
      throw new BadRequestException(`Phase Project does not belong to project`);
    }

    ensurePhaseProjectIsInProgressOrCompletedForAudit(phaseProject);
    ensureAuditCanBeFinalizedOnlyWhenPhaseCompleted(phaseProject, input.status);

    audit.objetive = input.objetive;
    audit.id_user = input.id_user;
    audit.id_project = input.id_project;
    audit.observation = input.observation;
    audit.date_revision = new Date(input.date_revision);
    audit.id_phase_project = input.id_phase_project;
    audit.status = input.status;

    const updated = await this.repo.save(audit);

    const phaseCompletion = await this.tryCompletePhaseProject(
      input.id_phase_project,
    );

    return {
      audit: updated,
      phaseCompletion,
    };
  }

  private async tryCompletePhaseProject(phaseProjectId: string) {
    const phaseProject = await this.repoPhaseProject.findById(phaseProjectId);

    if (!phaseProject) {
      throw new NotFoundException(
        `Phase Project with id: "${phaseProjectId}" not found`,
      );
    }

    const tasks =
      await this.repoPhaseProjectTask.findByPhaseProjectId(phaseProjectId);

    const evidences =
      await this.repoEvidence.findByPhaseProjectId(phaseProjectId);

    const audits = await this.repo.findByPhaseProject(phaseProjectId);

    const contributions =
      await this.repoContribution.findByPhaseProjectId(phaseProjectId);

    const result = this.workflow.canMovePhaseToCompleted({
      phase: phaseProject,
      tasks,
      manual: false,
      hasEvidenceRegistered: evidences.length > 0,
      hasAuditRegisteredAndFinalized: audits.some(
        (a) => a.status === AuditStatus.FINALIZED,
      ),
      hasContributionRegistered: contributions.length > 0,
    });

    if (!result.allowed) {
      return {
        completed: false,
        message: result.reason,
      };
    }

    phaseProject.status = PhaseProjectStatus.COMPLETED;
    await this.repoPhaseProject.save(phaseProject);

    return {
      completed: true,
    };
  }
}
