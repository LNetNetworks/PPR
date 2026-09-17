import { Module } from "@nestjs/common";
import { TokensController } from "../controllers/tokens.controller";

import { BlockchainIntegrationModule } from "../../integrations/blockchain/blockchain.module";

@Module({
  imports: [BlockchainIntegrationModule],
  controllers: [TokensController],
})
export class TokensModule {}
