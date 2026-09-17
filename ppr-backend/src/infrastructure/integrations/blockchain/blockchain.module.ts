import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenBlockchainClient } from "./token.blockchain.client";
import { EvidenceBlockchainClient } from "./evidence.blockchain.client";
import { EvidenceBlockchainPort } from "../../../application/integrations/ports/evidence.blockchain.port";
import { LacchainSignerFactory } from "./providers/lacchain.providers";
import { BlockchainController } from "../../../infrastructure/http/controllers/blockchain.controller";
import { AuthRpcProviderFactory } from "./providers/auth-rpc.provider";
import { KeycloakAuthTokenService } from "./auth/keycloak-auth-token.service";
import { BlockchainSignerFactory } from "./providers/blockchain-signer.factory";
import { TokenBlockchainPort } from "../../../application/integrations/ports/token.blockchain.port";

@Module({
  imports: [ConfigModule],
  controllers: [BlockchainController],
  providers: [
    KeycloakAuthTokenService,
    EvidenceBlockchainClient,
    TokenBlockchainClient,
    {
      provide: BlockchainSignerFactory,
      useFactory: (
        config: ConfigService,
        tokenService: KeycloakAuthTokenService,
      ) => {
        const network = config.get<string>("blockchain.network");

        if (!network) {
          throw new Error("Missing required configuration: blockchain.network");
        }

        if (network === "prividium") {
          return new AuthRpcProviderFactory(config, tokenService);
        }

        return new LacchainSignerFactory(config);
      },
      inject: [ConfigService, KeycloakAuthTokenService],
    },
    { provide: EvidenceBlockchainPort, useExisting: EvidenceBlockchainClient },
    { provide: TokenBlockchainPort, useExisting: TokenBlockchainClient },
  ],
  exports: [TokenBlockchainPort, EvidenceBlockchainPort],
})
export class BlockchainIntegrationModule {}
