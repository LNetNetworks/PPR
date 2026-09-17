import { Injectable, BadRequestException } from "@nestjs/common";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { Evidence } from "../../../domain/evidences/evidence.entity";
import { GcpUploadClient } from "../../../infrastructure/integrations/storage/gcp-upload.client";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { EvidenceBlockchainPort } from "../../integrations/ports/evidence.blockchain.port";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { EvidenceStatus } from "../../../domain/evidences/evidence-status.enum";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectWorkflow } from "../../../domain/phases/services/phase-project-workflow";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { ensurePhaseProjectIsInProgressOrCompletedForEvidence } from "../../../domain/phases/rules/phase-project-workflow.rules";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";

function ensureBytes32(input: string) {
  if (input.startsWith("0x") && input.length === 66) return input;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

@Injectable()
export class CreateEvidenceUseCase {
  private readonly workflow = new PhaseProjectWorkflow();
  constructor(
    private readonly evidenceRepo: EvidenceRepository,
    private readonly gcpUpload: GcpUploadClient,
    private readonly seq: SequenceService,
    private readonly chain: EvidenceBlockchainPort,
    private readonly cfg: ConfigService,
    private readonly phaseProjectRepo: PhaseProjectRepository,
    private readonly phaseProjectTaskRepo: PhaseProjectTaskRepository,
    private readonly repo: ContributionRepository,
    private readonly repoEvidence: EvidenceRepository,
    private readonly repoAudit: AuditRevisionRepository,
  ) {}

  async execute(input: {
    id_project: string;
    id_user: string;
    file: Express.Multer.File;
    destinationPath?: string;
    id_phase_project?: string;
  }): Promise<{
    evidence: Evidence;
    phaseCompletion: {
      completed: boolean;
      message?: string;
    };
  }> {
    if (!input.id_phase_project) {
      throw new BadRequestException("Id Phase project is undefined or empty");
    }

    const phaseProject = await this.phaseProjectRepo.findById(
      input.id_phase_project,
    );

    if (!phaseProject || !phaseProject.id_phase) {
      throw new BadRequestException("Phase project not found");
    }

    if (phaseProject.id_project !== input.id_project) {
      throw new BadRequestException(
        "Phase project does not belong to the project",
      );
    }

    ensurePhaseProjectIsInProgressOrCompletedForEvidence(phaseProject);

    const nextNumber = await this.seq.next("evidences");
    const id_evidence = `evd_${String(nextNumber).padStart(3, "0")}`;

    const remotePath = input.destinationPath ?? input.id_project;
    const file_name = input.file.filename;
    const uploaded = await this.gcpUpload.uploadLocalFile(
      input.file.path,
      remotePath,
      input.file.filename,
      input.file.mimetype,
      true,
    );

    const docHash = ensureBytes32(
      uploaded.raw?.files?.[0]?.filename || uploaded.uri || input.file.filename,
    );
    const uidHash = ensureBytes32(input.id_user);

    const address = this.cfg.get<string>("blockchain.address_contract")!;
    const tx = await this.chain.addDoc(address, docHash, uidHash);

    const entity = new Evidence(
      id_evidence,
      input.id_project,
      input.id_user,
      file_name,
      uploaded.uri,
      EvidenceStatus.CREATED,
      tx.res,
      new Date(),
      input.id_phase_project,
    );
    await this.evidenceRepo.save(entity);
    const phaseCompletion = await this.tryCompletePhaseProjectByEvidence(
      input.id_phase_project,
    );

    return {
      evidence: entity,
      phaseCompletion,
    };
  }

  private async tryCompletePhaseProjectByEvidence(
    phaseProjectId?: string,
  ): Promise<{ completed: boolean; message?: string }> {
    if (!phaseProjectId) {
      return {
        completed: false,
        message: "Phase project id is required",
      };
    }

    const phaseProject = await this.phaseProjectRepo.findById(phaseProjectId);

    if (!phaseProject) {
      return {
        completed: false,
        message: `Phase Project with id: "${phaseProjectId}" not found`,
      };
    }

    const tasks =
      await this.phaseProjectTaskRepo.findByPhaseProjectId(phaseProjectId);

    const evidences =
      await this.repoEvidence.findByPhaseProjectId(phaseProjectId);

    const audits = await this.repoAudit.findByPhaseProject(phaseProjectId);

    const contributions = await this.repo.findByPhaseProjectId(phaseProjectId);

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
      return {
        completed: false,
        message: result.reason,
      };
    }

    phaseProject.status = PhaseProjectStatus.COMPLETED;
    await this.phaseProjectRepo.save(phaseProject);
    return {
      completed: true,
    };
  }
}
