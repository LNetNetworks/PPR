import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from "@nestjs/common";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { Project } from "../../../domain/projects/project.entity";
import {
  CreateProjectInput,
  ProjectOutput,
} from "../../../application/projects/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { OrganizationRepository } from "../../../domain/organizations/organization.repository";
import { ConfigService } from "@nestjs/config";
import { TokenBlockchainPort } from "../../integrations/ports/token.blockchain.port";
import { parseUnits, HDNodeWallet, formatUnits, isAddress } from "ethers";
import { UserRepository } from "../../../domain/users/user.repository";
import { UserRole } from "../../../domain/users/user-role.enum";
import { DomainError } from "../../../domain/shared/domain-error";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { ProjectUser } from "../../../domain/projects/project-user.entity";
import {
  AssetTokenMetadata,
  AssetTokenSymbol,
} from "../../../domain/projects/project-asset-token.enum";
import { QueueRepositoryPort } from "../../../application/queue/port/queue.repository.port";

@Injectable()
export class CreateProjectUseCase {
  private static readonly BRIDGE_TASK_TYPE = "PROJECT_BRIDGE_DEPOSIT";

  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly repo: ProjectRepository,
    private readonly seq: SequenceService,
    private readonly cfg: ConfigService,
    private readonly chain: TokenBlockchainPort,
    private readonly userRepo: UserRepository,
    private readonly userProRepo: ProjectUserRepository,
    private readonly queue: QueueRepositoryPort,
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectOutput> {
    try {
      const org = await this.orgRepo.findById(input.id_organization);
      if (!org) {
        throw new NotFoundException(
          `Organization wiht id: "${input.id_organization}" not found`,
        );
      }

      if (!input.uid) {
        throw new BadRequestException(`The uid of User is empty`);
      }

      if (
        !input.total_contributed_amount ||
        input.total_contributed_amount === 0
      ) {
        throw new BadRequestException(
          `The value of total_contributed_amount is invalid or empty`,
        );
      }

      const user = await this.userRepo.findByKeycloakSub(input.uid);
      const sponsorUser = user;

      if (!sponsorUser) throw new NotFoundException("User not found");

      if (sponsorUser.role !== UserRole.SPONSOR) {
        throw new ForbiddenException("Only SPONSOR can create projects");
      }

      if (
        !input.total_contributed_amount ||
        input.total_contributed_amount <= 0n
      ) {
        throw new BadRequestException(
          "The value of Total contributed is invalid or empty",
        );
      }

      const tokenInfo = AssetTokenMetadata[input.asset_token];
      if (!tokenInfo) {
        throw new BadRequestException(
          `Invalid asset token: ${input.asset_token}`,
        );
      }

      const blockchainNetwork = this.cfg
        .get<string>("blockchain.network")!
        .trim()
        .toLowerCase();

      const tokenContractAddress = this.cfg.get<string>(
        "blockchain.address_token",
      )!;
      const usdcContractAddress = this.cfg.get<string>(
        "blockchain.address_token_usdc",
      )!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const prividiumContractAddress = this.cfg.get<string>(
        "blockchain.address_gas_prividium",
      )!;
      const walletDerivationNamespace =
        this.cfg.get<number>("wallet.derivationNamespace") ?? 0;
      const isLacchain = blockchainNetwork === "lacchain";
      const isPrividium = blockchainNetwork === "prividium";
      const useBridgeDeposit =
        input.asset_token === AssetTokenSymbol.USDC && isPrividium;
      const activeTokenContractAddress =
        input.asset_token === AssetTokenSymbol.TOKEN
          ? tokenContractAddress
          : usdcContractAddress;

      if (input.asset_token === AssetTokenSymbol.TOKEN && !isLacchain) {
        throw new BadRequestException(
          `Invalid blockchain network "${blockchainNetwork}" for asset token "${input.asset_token}". Expected lacchain.`,
        );
      }

      if (input.asset_token === AssetTokenSymbol.USDC && !isPrividium) {
        throw new BadRequestException(
          `Invalid blockchain network "${blockchainNetwork}" for asset token "${input.asset_token}". Expected prividium.`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const keycloak_auth_server_url =
        this.cfg.get<number>("keycloak.authServerUrl") ?? "";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const zk_keycloak_url =
        this.cfg.get<number>("zk_keycloak_token_url") ?? "";

      const walletProvider = input.wallet_provider?.trim();
      const normalizedWalletProvider = walletProvider ?? "";

      if (useBridgeDeposit && !walletProvider) {
        throw new BadRequestException(
          "wallet_provider is required when using Bridge deposits",
        );
      }

      if (useBridgeDeposit && !isAddress(normalizedWalletProvider)) {
        throw new BadRequestException(
          "wallet_provider must be a valid blockchain address when using Bridge deposits",
        );
      }

      const seedUser = this.cfg.get<string>("blockchain.gsponsor_seed")!;

      const walletUser = HDNodeWallet.fromPhrase(
        seedUser,
        undefined,
        "m/44'/60'/0'/0/0",
      );

      if (!sponsorUser.wallet_address_token) {
        sponsorUser.wallet_address_token = walletUser.address;
        await this.userRepo.save(sponsorUser);
      }

      const nextNumber = await this.seq.next("projects");
      const id_project = `prj_${String(nextNumber).padStart(3, "0")}`;
      let walletNumber = 0;
      let walletProject = HDNodeWallet.fromPhrase(
        seedUser,
        undefined,
        `m/44'/60'/0'/0/${walletDerivationNamespace}/0`,
      );

      while (true) {
        walletNumber = await this.seq.next("project_wallets");
        walletProject = HDNodeWallet.fromPhrase(
          seedUser,
          undefined,
          `m/44'/60'/0'/0/${walletDerivationNamespace}/${walletNumber}`,
        );
        const walletExists = await this.repo.existsByWalletToken(
          walletProject.address,
        );

        if (walletExists) {
          console.warn("Project wallet rejected, advancing index", {
            id_project,
            walletNamespace: walletDerivationNamespace,
            walletNumber,
            wallet_token: walletProject.address,
            existsInDb: walletExists,
            tokenBalance: "skipped-db-exists",
          });
          continue;
        }

        break;
      }

      const p = new Project(
        id_project,
        input.type_project,
        new Date(input.date_start),
        input.name_project,
        input.id_organization,
        input.country_region,
        input.status,
        new Date(input.date_end),
        input.description,
        input.total_contributed_amount,
        walletProvider,
        walletProject.address,
        String(walletNumber),
        input.asset_token,
        input.type_currency,
      );
      const to = walletProject.address;
      const context = "Mint_initial";
      const uid = id_project;

      let tokenBalance: string;
      let jobId: string | null = null;
      let enqueued = false;
      let saved: Project;

      if (useBridgeDeposit) {
        const decimals = tokenInfo.decimals;
        const usdcTransferAmount = parseUnits("1", decimals);
        const nativeTransferAmount = parseUnits("1", 18);
        const transferPrivateKey = this.cfg.get<string>(
          "blockchain.gponsor_transfer_contract",
        )!;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const transferRes = await this.chain.transfer({
          contractAddress: usdcContractAddress,
          to: walletProject.address,
          amount: usdcTransferAmount,
          uid,
          context: "Project_wallet_usdc_fund_before_bridge_deposit",
          privateKey: transferPrivateKey,
        });

        const usdcBalanceAfterTransfer = await this.chain.balanceOf({
          contractAddress: usdcContractAddress,
          account: walletProject.address,
        });

        if (usdcBalanceAfterTransfer < usdcTransferAmount) {
          throw new BadRequestException(
            "USDC balance was not properly funded before bridge enqueue",
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const prividiumTransferRes = await this.chain.transferNative({
          to: walletProject.address,
          amount: nativeTransferAmount,
          uid,
          context: "Project_wallet_native_fund_before_bridge_deposit",
          privateKey: transferPrivateKey,
        });

        const prividiumBalanceAfterTransfer = await this.chain.balanceNativeOf({
          account: walletProject.address,
        });
        if (prividiumBalanceAfterTransfer < nativeTransferAmount) {
          throw new BadRequestException(
            "Prividium native balance was not properly funded before bridge enqueue",
          );
        }

        tokenBalance = String(input.total_contributed_amount);
        saved = await this.repo.save(p);

        try {
          const jobRes = await this.queue.createJob({
            requestedBy: sponsorUser.id_user,
            type: CreateProjectUseCase.BRIDGE_TASK_TYPE,
            total: 1,
          });

          const tasksRes = await this.queue.bulkCreateTasks({
            jobId: jobRes.jobId,
            type: CreateProjectUseCase.BRIDGE_TASK_TYPE,
            tasks: [
              {
                dedupeKey: `PROJECT_BRIDGE_DEPOSIT|${saved.id_project}`,
                payload: {
                  projectId: saved.id_project,
                },
              },
            ],
          });

          jobId = jobRes.jobId;
          enqueued = tasksRes.inserted > 0;
        } catch (queueError: any) {
          console.error("BRIDGE FLOW enqueue failed", {
            projectId: saved.id_project,
            error: queueError?.message ?? queueError,
          });
          jobId = null;
          enqueued = false;
        }
      } else {
        const can = await this.chain.canMint({
          contractAddress: activeTokenContractAddress,
          account: walletUser.address,
        });

        if (!can) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const grantMinterRes = await this.chain.grantMinter({
            contractAddress: activeTokenContractAddress,
            account: walletUser.address,
          });
        }

        const decimals = tokenInfo.decimals;
        const amount = parseUnits(
          String(input.total_contributed_amount),
          decimals,
        );
        const privateKey = walletUser.privateKey;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const mintRes = await this.chain.mint({
          contractAddress: activeTokenContractAddress,
          to,
          amount,
          uid,
          context,
          privateKey,
        });

        const balProject = await this.chain.balanceOf({
          contractAddress: activeTokenContractAddress,
          account: to,
        });

        const balanceBI = BigInt(Math.floor(Number(balProject)));
        tokenBalance = formatUnits(balanceBI, tokenInfo.decimals);
        saved = await this.repo.save(p);
      }

      const nextProyectUser = await this.seq.next("projects_user");
      const id_project_user = `pu_${String(nextProyectUser).padStart(3, "0")}`;

      const proyUser = new ProjectUser(
        id_project_user,
        saved.id_project,
        user.id_user,
      );

      await this.userProRepo.save(proyUser);
      return {
        project: saved,
        token_balance: tokenBalance,
        job_id: jobId,
        enqueued,
      };
    } catch (e) {
      if (e instanceof DomainError) {
        const statusMap: Record<string, number> = {
          BAD_REQUEST: 400,
          NOT_FOUND: 404,
          CONFLICT: 409,
          FORBIDDEN: 403,
          UNAUTHORIZED: 401,
          DOMAIN_ERROR: 500,
        };

        throw new HttpException(
          {
            message: e.message,
            code: e.code,
            details: e.details,
          },
          statusMap[e.code] ?? 500,
        );
      }
      throw e;
    }
  }
}
