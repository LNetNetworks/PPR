import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Contribution } from "../../../domain/contributions/contribution.entity";
import { CreateContributionInput } from "../../../application/contributions/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { UserRole } from "../../../domain/users/user-role.enum";
import { parseUnits, HDNodeWallet } from "ethers";
import { TokenBlockchainPort } from "../../integrations/ports/token.blockchain.port";
import { ConfigService } from "@nestjs/config";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectWorkflow } from "../../../domain/phases/services/phase-project-workflow";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { ensurePhaseProjectIsInProgress } from "../../../domain/phases/rules/phase-project-workflow.rules";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";
import { AssetTokenSymbol } from "../../../domain/projects/project-asset-token.enum";
import { QueueRepositoryPort } from "../../../application/queue/port/queue.repository.port";

@Injectable()
export class CreateContributionUseCase {
  private readonly workflow = new PhaseProjectWorkflow();

  constructor(
    private readonly repo: ContributionRepository,
    private readonly seq: SequenceService,
    private readonly repoProject: ProjectRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly chain: TokenBlockchainPort,
    private readonly cfg: ConfigService,
    private readonly repoProjectUser: ProjectUserRepository,
    private readonly repoPhaseProjectTask: PhaseProjectTaskRepository,
    private readonly repoEvidence: EvidenceRepository,
    private readonly repoAudit: AuditRevisionRepository,
    private readonly queue: QueueRepositoryPort,
  ) {}

  async execute(input: CreateContributionInput): Promise<{
    contribution: Contribution;
    phaseCompletion: {
      completed: boolean;
      message?: string;
    };
    tx_hash?: string | null;
    job_id?: string | null;
    enqueued?: boolean;
  }> {
    const project = await this.repoProject.findById(input.id_project);
    if (!project) {
      throw new NotFoundException(
        `Project with id: "${input.id_project}" not found`,
      );
    }

    if (!input.id_phase_project) {
      throw new BadRequestException("Id Phase project is undefined or empty");
    }

    const phaseProject = await this.repoPhaseProject.findById(
      input.id_phase_project,
    );

    if (!phaseProject || !phaseProject.id_phase) {
      throw new NotFoundException(
        `Phase Project with id: "${input.id_phase_project}" not found`,
      );
    }

    if (phaseProject.id_project !== input.id_project) {
      throw new BadRequestException(
        "Phase project does not belong to the project",
      );
    }

    ensurePhaseProjectIsInProgress(phaseProject);

    if (!input.uid) {
      throw new BadRequestException(`The uid of User is empty`);
    }

    const user = await this.userRepo.findByKeycloakSub(input.uid);

    if (!user) throw new NotFoundException("User not found");

    if (user.role !== UserRole.SPONSOR) {
      throw new ForbiddenException("Only SPONSOR can create projects");
    }

    if (!input.deposit_amount || input.deposit_amount === 0) {
      throw new BadRequestException("The value of amount is invalid.");
    }

    const seedSponsor = this.cfg.get<string>("blockchain.gsponsor_seed")!;
    const walletDerivationNamespace =
      this.cfg.get<number>("wallet.derivationNamespace") ?? 0;
    const projectWallet = this.resolveProjectWallet({
      seedSponsor,
      walletIndexToken: project.wallet_index_token,
      walletToken: project.wallet_token,
      walletDerivationNamespace,
    });

    const usersProject = await this.repoProjectUser.findAll({
      projectId: project.id_project,
    });

    if (usersProject.length === 0) {
      throw new BadRequestException("The project doesn't have members.");
    }

    const provider = usersProject.find((user) => user.userRole === "provider");

    if (!provider) {
      throw new BadRequestException(
        "The project doesn't have a member with a  provider rol",
      );
    }

    const providerWallet = project.wallet_provider?.trim();

    if (!providerWallet) {
      throw new BadRequestException(
        "The project doesn't have registerd a wallet",
      );
    }

    const nextNumber = await this.seq.next("contributions");
    const id_contribution = `con_${String(nextNumber).padStart(3, "0")}`;

    let txHash: string | null = null;

    const blockchainNetwork = this.cfg
      .get<string>("blockchain.network")!
      .trim()
      .toLowerCase();
    const isLacchain = blockchainNetwork === "lacchain";
    const isPrividium = blockchainNetwork === "prividium";
    const tokenContractAddress = this.cfg.get<string>(
      "blockchain.address_token",
    )!;
    const usdcContractAddress = this.cfg.get<string>(
      "blockchain.address_token_usdc",
    )!;
    const activeTokenContractAddress =
      project.asset_token === AssetTokenSymbol.TOKEN
        ? tokenContractAddress
        : usdcContractAddress;

    if (project.asset_token === AssetTokenSymbol.TOKEN && !isLacchain) {
      throw new BadRequestException(
        `Invalid blockchain network "${blockchainNetwork}" for asset token "${project.asset_token}". Expected lacchain.`,
      );
    }

    if (project.asset_token === AssetTokenSymbol.USDC && !isPrividium) {
      throw new BadRequestException(
        `Invalid blockchain network "${blockchainNetwork}" for asset token "${project.asset_token}". Expected prividium.`,
      );
    }

    if (
      project.asset_token !== AssetTokenSymbol.TOKEN &&
      project.asset_token !== AssetTokenSymbol.USDC
    ) {
      throw new BadRequestException(
        `Unsupported asset token "${project.asset_token}" for contribution flow.`,
      );
    }

    if (project.asset_token === AssetTokenSymbol.TOKEN) {
      const can = await this.chain.canTransfer({
        contractAddress: activeTokenContractAddress,
        account: projectWallet.address,
      });

      if (!can) {
        await this.chain.grantTransferer({
          contractAddress: activeTokenContractAddress,
          account: projectWallet.address,
        });
        await new Promise((r) => setTimeout(r, 5000));
      }

      const decimals = 18;

      const transferRes = await this.chain.transfer({
        contractAddress: activeTokenContractAddress,
        to: providerWallet,
        amount: parseUnits(String(input.deposit_amount), decimals),
        uid: `transfer:${input.id_project}:${provider.id_user}:${project.id_project}`,
        context: "Project_to_provider",
        privateKey: projectWallet.privateKey,
      });
      txHash = transferRes.txHash;
    }

    const payment = new Contribution(
      id_contribution,
      input.id_project,
      input.id_user,
      input.deposit_amount,
      input.id_phase_project,
      new Date(input.date_contribution),
    );

    phaseProject.contribution_received =
      (phaseProject.contribution_received ?? 0) + input.deposit_amount;
    await this.repoPhaseProject.save(phaseProject);

    const saveContribution = await this.repo.save(payment);

    let jobId: string | null = null;
    let enqueued = false;

    if (project.asset_token === AssetTokenSymbol.USDC) {
      try {
        const jobRes = await this.queue.createJob({
          requestedBy: user.id_user,
          type: "PROJECT_BRIDGE_WITHDRAW",
          total: 1,
        });

        const tasksRes = await this.queue.bulkCreateTasks({
          jobId: jobRes.jobId,
          type: "PROJECT_BRIDGE_WITHDRAW",
          tasks: [
            {
              dedupeKey: `PROJECT_BRIDGE_WITHDRAW|${project.id_project}|${phaseProject.id_phase}|${id_contribution}`,
              payload: {
                projectId: project.id_project,
                id_phase: phaseProject.id_phase,
                contributionId: id_contribution,
                amount: input.deposit_amount,
                to: providerWallet,
              },
            },
          ],
        });

        jobId = jobRes.jobId;
        enqueued = tasksRes.inserted > 0;
      } catch (queueError: any) {
        console.error("CONTRIBUTION BRIDGE withdraw enqueue failed", {
          projectId: project.id_project,
          id_phase: phaseProject.id_phase,
          contributionId: id_contribution,
          error: queueError?.message ?? queueError,
        });
      }
    }

    const phaseCompletion = await this.tryCompletePhaseProjectByContribution(
      phaseProject.id_phase_project,
    );

    return {
      contribution: saveContribution,
      phaseCompletion,
      tx_hash: txHash,
      job_id: jobId,
      enqueued,
    };
  }

  private async tryCompletePhaseProjectByContribution(
    phaseProjectId: string,
  ): Promise<{ completed: boolean; message?: string }> {
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
    await this.repoPhaseProject.save(phaseProject);
    return {
      completed: true,
    };
  }

  private resolveProjectWallet(input: {
    seedSponsor: string;
    walletIndexToken?: string | null;
    walletToken?: string | null;
    walletDerivationNamespace: number;
  }): HDNodeWallet {
    const walletIndexToken = input.walletIndexToken?.trim();
    const walletToken = input.walletToken?.trim();

    if (!walletIndexToken) {
      throw new BadRequestException(
        "Project wallet index token is missing. The project cannot be resolved.",
      );
    }

    if (!walletToken) {
      throw new BadRequestException(
        "Project wallet token is missing. The project cannot be resolved.",
      );
    }

    const currentCandidate = HDNodeWallet.fromPhrase(
      input.seedSponsor,
      undefined,
      `m/44'/60'/0'/0/${input.walletDerivationNamespace}/${walletIndexToken}`,
    );

    if (this.sameAddress(currentCandidate.address, walletToken)) {
      return currentCandidate;
    }

    const legacyCandidate = HDNodeWallet.fromPhrase(
      input.seedSponsor,
      undefined,
      `m/44'/60'/0'/0/${walletIndexToken}`,
    );

    if (this.sameAddress(legacyCandidate.address, walletToken)) {
      return legacyCandidate;
    }

    throw new BadRequestException(
      `Unable to resolve project wallet for index "${walletIndexToken}" and stored token "${walletToken}".`,
    );
  }

  private sameAddress(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }
}
