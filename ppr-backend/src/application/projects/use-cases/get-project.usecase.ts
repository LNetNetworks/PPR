import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { ProjectOutput } from "../../../application/projects/use-cases/types";
import { TokenBlockchainPort } from "../../integrations/ports/token.blockchain.port";
import { formatUnits } from "ethers";
import { ConfigService } from "@nestjs/config";
import {
  AssetTokenMetadata,
  AssetTokenSymbol,
} from "../../../domain/projects/project-asset-token.enum";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class GetProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly chain: TokenBlockchainPort,
    private readonly cfg: ConfigService,
  ) {}

  async execute(id: string): Promise<ProjectOutput> {
    let balProject, balFormated;
    const project = await this.projectRepo.findById(id);
    if (!project)
      throw new NotFoundException(`Project with id '${id}' not found`);
    const blockchainNetwork = this.cfg
      .get<string>("blockchain.network")!
      .trim()
      .toLowerCase();
    const isLacchain = blockchainNetwork === "lacchain";
    const isPrividium = blockchainNetwork === "prividium";

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

    const contractAddress =
      project.asset_token === AssetTokenSymbol.TOKEN
        ? this.cfg.get<string>("blockchain.address_token")!
        : this.cfg.get<string>("blockchain.address_token_usdc")!;
    const tokenInfo = AssetTokenMetadata[project.asset_token];

    if (project.wallet_token) {
      balProject = await this.chain.balanceOf({
        contractAddress,
        account: project.wallet_token,
      });
      balFormated = formatUnits(balProject, tokenInfo.decimals);
    }
    return { project, token_balance: balFormated };
  }
}
