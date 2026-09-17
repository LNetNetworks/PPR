import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { Project } from "../../../domain/projects/project.entity";
import { ProjectStatus } from "../../../domain/projects/project-status.enum";
import { UpdateProjectInput } from "../../../application/projects/use-cases/types";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { ensureProjectHasMinimumRequiredPhases } from "../../../domain/phases/rules/phase-project.rules";
import { AssetTokenSymbol } from "../../../domain/projects/project-asset-token.enum";
import { isAddress } from "ethers";

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly cfg: ConfigService,
  ) {}

  async execute(id: string, input: UpdateProjectInput): Promise<Project> {
    const existProject = await this.repo.findById(id);

    if (!existProject) throw new NotFoundException("Project not found");

    const nextStatus: ProjectStatus | undefined = input.status
      ? (String(input.status).toLowerCase() as ProjectStatus)
      : existProject.status;

    if (input.status && nextStatus !== existProject.status) {
      const phases = await this.repoPhaseProject.findByProject(id);
      ensureProjectHasMinimumRequiredPhases(phases);
    }

    const nextTypeProject = input.type_project ?? existProject.type_project;
    const nextDateStart = new Date(input.date_start ?? existProject.date_start);
    const nextNameProject = input.name_project ?? existProject.name_project;
    const nextOrganization =
      input.id_organization ?? existProject.id_organization;
    const nextCountryRegion =
      input.country_region ?? existProject.country_region;
    const nextDateEnd = new Date(input.date_end ?? existProject.date_end);
    const nextDescription = input.description ?? existProject.description;
    const nextTotalContributedAmount =
      input.total_contributed_amount ?? existProject.total_contributed_amount;
    const nextWalletProvider =
      input.wallet_provider?.trim() ?? existProject.wallet_provider?.trim();
    const nextWalletToken = input.wallet_token ?? existProject.wallet_token;
    const nextWalletIndexToken =
      input.wallet_index_token ?? existProject.wallet_index_token;
    const nextAssetToken = input.asset_token ?? existProject.asset_token;
    const nextTypeCurrency = input.type_currency ?? existProject.type_currency;
    const normalizedWalletProvider = nextWalletProvider ?? "";
    const blockchainNetwork = this.cfg
      .get<string>("blockchain.network")!
      .trim()
      .toLowerCase();
    const useBridgeDeposit =
      nextAssetToken === AssetTokenSymbol.USDC &&
      blockchainNetwork === "prividium";

    if (useBridgeDeposit && !nextWalletProvider) {
      throw new BadRequestException(
        "wallet_provider is required when using Bridge deposits",
      );
    }

    if (useBridgeDeposit && !isAddress(normalizedWalletProvider)) {
      throw new BadRequestException(
        "wallet_provider must be a valid blockchain address when using Bridge deposits",
      );
    }

    const next = new Project(
      id,
      nextTypeProject,
      nextDateStart,
      nextNameProject,
      nextOrganization,
      nextCountryRegion,
      nextStatus,
      nextDateEnd,
      nextDescription,
      nextTotalContributedAmount,
      nextWalletProvider,
      nextWalletToken,
      nextWalletIndexToken,
      nextAssetToken,
      nextTypeCurrency,
    );
    return this.repo.save(next);
  }
}
