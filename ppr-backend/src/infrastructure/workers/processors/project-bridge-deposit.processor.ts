import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueTaskProcessor } from "./queue-task.processor";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { AssetTokenSymbol } from "../../../domain/projects/project-asset-token.enum";
import { TokenBlockchainPort } from "../../../application/integrations/ports/token.blockchain.port";
import { BridgeService } from "../../../infrastructure/integrations/bridge/bridge.service";

@Injectable()
export class ProjectBridgeDepositProcessor implements QueueTaskProcessor {
  type = "PROJECT_BRIDGE_DEPOSIT";

  constructor(
    private readonly repoProject: ProjectRepository,
    private readonly config: ConfigService,
    private readonly chain: TokenBlockchainPort,
    private readonly bridge: BridgeService,
  ) {}

  async process(task: { payload: any; jobId: string; id: string }) {
    const projectId = task?.payload?.projectId;
    if (!projectId) {
      throw new BadRequestException("Invalid bridge task payload");
    }

    const project = await this.repoProject.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    if (project.asset_token === AssetTokenSymbol.TOKEN) {
      return { skipped: true, reason: "Project does not require bridge" };
    }

    const usdcContractAddress = this.config.get<string>(
      "blockchain.address_token_usdc",
    )!;
    const projectWallet = project.wallet_token?.trim();
    if (!projectWallet) {
      throw new BadRequestException(
        `Project wallet token is missing for project "${projectId}"`,
      );
    }
    const depositAmount = Number(project.total_contributed_amount ?? 0);

    if (depositAmount <= 0) {
      throw new BadRequestException("Bridge deposit amount is invalid");
    }

    const balanceBefore = await this.chain.balanceOf({
      contractAddress: usdcContractAddress,
      account: projectWallet,
    });

    if (balanceBefore <= 0n) {
      throw new BadRequestException(
        "Project wallet has no USDC balance available for bridge deposit",
      );
    }

    const depositRes = await this.bridge.deposit({
      to: projectWallet,
      amount: depositAmount,
    });

    const balanceAfter = await this.chain.balanceOf({
      contractAddress: usdcContractAddress,
      account: projectWallet,
    });

    return {
      ok: true,
      projectId,
      jobId: task.jobId,
      projectWallet,
      depositResponse: depositRes,
      usdcBalanceAfterDeposit: balanceAfter.toString(),
    };
  }
}
