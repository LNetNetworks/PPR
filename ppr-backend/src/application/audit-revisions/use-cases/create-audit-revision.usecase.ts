import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { AuditRevision } from "../../../domain/audit-revisions/audit-revision.entity";
import { CreateAuditRevisionInput } from "./types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
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

@Injectable()
export class CreateAuditRevisionUseCase {
  private readonly workflow = new PhaseProjectWorkflow();

  constructor(
    private readonly repo: AuditRevisionRepository,
    private readonly seq: SequenceService,
    private readonly repoProject: ProjectRepository,
    private readonly repoUser: UserRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoPhaseProjectTask: PhaseProjectTaskRepository,
    private readonly repoEvidence: EvidenceRepository,
    private readonly repoContribution: ContributionRepository,
  ) {}

  async execute(input: CreateAuditRevisionInput): Promise<AuditRevision> {
    const nextNumber = await this.seq.next("AuditRevisions");
    const id_audit_revision = `aud_${String(nextNumber).padStart(3, "0")}`;

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
      throw new BadRequestException(
        `Phase Project with id: "${input.id_phase_project}" does not belong to project "${input.id_project}"`,
      );
    }
    ensurePhaseProjectIsInProgressOrCompletedForAudit(phaseProject);
    ensureAuditCanBeFinalizedOnlyWhenPhaseCompleted(phaseProject, input.status);

    const auditRevision = new AuditRevision(
      input.objetive,
      id_audit_revision,
      input.id_user,
      input.id_project,
      input.observation,
      new Date(input.date_revision),
      input.id_phase_project,
      input.status,
    );

    const savedAuditRevision = await this.repo.save(auditRevision);

    await this.tryCompletePhaseProjectByAudit(input.id_phase_project);

    return savedAuditRevision;
  }

  private async tryCompletePhaseProjectByAudit(
    phaseProjectId: string,
  ): Promise<void> {
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
        (audit) => audit.status === AuditStatus.FINALIZED,
      ),
      hasContributionRegistered: contributions.length > 0,
    });

    if (!result.allowed) {
      return;
    }

    phaseProject.status = PhaseProjectStatus.COMPLETED;
    await this.repoPhaseProject.save(phaseProject);
  }
}
