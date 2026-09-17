import { Injectable, BadRequestException } from "@nestjs/common";
import { UserRepository } from "../../../domain/users/user.repository";
import { OrganizationUserRepository } from "../../../domain/organizations/organization-user.repository";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { QueueTaskProcessor } from "../../workers/processors/queue-task.processor";
import { EnsurePokUserUseCase } from "../../../application/users/use-cases/ensure-user.usecase";
import { ConfigService } from "@nestjs/config";
import { PokService } from "../../../infrastructure/integrations/pok/pok.service";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { CreateEvidenceUseCase } from "../../../application/evidences/use-cases/create-evidence.usecase";
import { CreateProjectUserUseCase } from "../../../application/projects/use-cases/create-project-user.usecase";
import * as path from "path";
import * as fs from "fs";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";

@Injectable()
export class PokTitlesSyncProcessor implements QueueTaskProcessor {
  type = "POK_TITLES_SYNC";

  constructor(
    private readonly ensurePokUser: EnsurePokUserUseCase,
    private readonly config: ConfigService,
    private readonly users: UserRepository,
    private readonly orgUsers: OrganizationUserRepository,
    private readonly seq: SequenceService,
    private readonly pok: PokService,
    private readonly createEvidence: CreateEvidenceUseCase,
    private readonly evidenceRepo: EvidenceRepository,
    private readonly proyUserUC: CreateProjectUserUseCase,
    private readonly proyUserRepo: ProjectUserRepository,
    private readonly phaseProyRepo: PhaseProjectRepository,
  ) {}

  async process(task: { payload: any }) {
    const { projectId, phaseId, holder, vc } = task.payload;
    const email = holder?.email;
    const fullName = holder?.name ?? null;
    const vcId = vc?.id;

    const phaseProject = await this.phaseProyRepo.findByPhase({
      phaseId,
      projectId,
    });

    if (!phaseProject) {
      throw new BadRequestException("Invalid Phase Id");
    }

    const phaseProjectId = phaseProject.id_phase_project;

    if (!projectId || !phaseId || !email || !vcId) {
      throw new BadRequestException("Invalid Task upload");
    }

    const file_name = `${projectId}-${phaseId}-${vcId}`;

    const existing = await this.evidenceRepo.findByProjectAndFileName(
      projectId,
      file_name,
    );
    if (existing?.uri && existing?.tx_hash) {
      return { skipped: true, id_evidence: existing.id_evidence };
    }

    const user = await this.ensurePokUser.execute({
      email,
      fullName,
    });

    const projUsers = await this.proyUserRepo.findAll({ projectId });

    const alreadyMember = projUsers?.find(
      (item) => item.id_user === user.id_user,
    );

    if (!alreadyMember) {
      await this.proyUserUC.executeMany(projectId, [{ id_user: user.id_user }]);
    }

    const { buffer, contentType } = await this.pok.downloadDecryptedImage(vcId);
    const uploadsDir = path.resolve("./uploads");
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    const localPath = path.join(uploadsDir, file_name);

    fs.writeFileSync(localPath, buffer);

    try {
      const result = await this.createEvidence.execute({
        id_project: projectId,
        id_user: user.id_user,
        id_phase_project: phaseProjectId,
        file: {
          filename: file_name,
          originalname: file_name,
          path: localPath,
          mimetype: contentType,
          size: buffer.length,
        } as any,
        destinationPath: projectId,
      });
      return { ok: true, id_evidence: result.evidence.id_evidence };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(
        `Failed to sync title for project ${projectId} phaseprojectid ${phaseProjectId} phaseId . ${phaseId}: ${message}`,
      );
    } finally {
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
          console.log("Local file cleaned up successfully");
        } catch (e: unknown) {
          console.error("Error deleting local file:", e);
        }
      } else {
        console.log("Local file already removed or never created.");
      }
    }
  }
}
