import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AuditRevisionRepository } from "../../../../domain/audit-revisions/audit-revision.repository";
import { AuditRevision } from "../../../../domain/audit-revisions/audit-revision.entity";
import { SequenceService } from "../../../../infrastructure/persistence/mongoose/services/sequence.service";
import { ProjectRepository } from "../../../../domain/projects/project.repository";
import { UserRepository } from "../../../../domain/users/user.repository";
import { PhaseProjectRepository } from "../../../../domain/phases/phase-project.repository";
import { AuditStatus } from "../../../../domain/audit-revisions/audit-revision-status.enum";

@Injectable()
export class EnsurePendingAuditRevisionPhaseService {
  constructor(
    private readonly auditRevisionRepository: AuditRevisionRepository,
    private readonly seq: SequenceService,
    private readonly repoProject: ProjectRepository,
    private readonly repoUser: UserRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
  ) {}

  async execute(input: {
    id_project: string;
    id_phase_project: string;
    id_user: string;
  }): Promise<AuditRevision> {
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

    const audiExist = await this.auditRevisionRepository.findByPhaseProject(
      input.id_phase_project,
    );
    let currentAudiExist;
    if (!audiExist || audiExist.length == 0) {
      const status = AuditStatus.PLANNED;
      const objetiveAudit = "Standard Stage Review";
      const observation = "Planned configuration review";
      const dateAudit = new Date(phaseProject.date_end);

      const nextNumber = await this.seq.next("AuditRevisions");
      const id_audit_revision = `aud_${String(nextNumber).padStart(3, "0")}`;
      const auditRevision = new AuditRevision(
        objetiveAudit,
        id_audit_revision,
        input.id_user,
        input.id_project,
        observation,
        new Date(dateAudit.getTime() + 7 * 24 * 60 * 60 * 1000),
        input.id_phase_project,
        status,
      );
      currentAudiExist = await this.auditRevisionRepository.save(auditRevision);
    }
    return audiExist.length > 0 ? audiExist[0] : currentAudiExist;
  }
}
