import { Controller, Post, Req, Body, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TokenBlockchainPort } from "../../../application/integrations/ports/token.blockchain.port";
import { DeployTokenDto } from "../dto/token/deploy-token.dto";
import { GrantRoleDto } from "../dto/token/grant-role.dto";
import { Roles } from "nest-keycloak-connect";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import type { CustomRequest } from "../interceptor/request.interface";
import { ApiOperation } from "@nestjs/swagger";
@ApiTags("TokenPPR")
//@ApiBearerAuth('keycloak')
@Controller("tokens")
export class TokensController {
  constructor(private readonly token: TokenBlockchainPort) {}
  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post("deploy")
  @ApiOperation({ summary: "Deploy TokenPPR contract" })
  async deploy(@Body() dto: DeployTokenDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.DEPLOY_CONTRACT_TOKEN;
    const res = await this.token.deployToken({
      name: dto.name,
      symbol: dto.symbol,
    });
    return { Success: true, data: res };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post("roles/minter/grant")
  @ApiOperation({ summary: "Grant MINTER_ROLE to an address" })
  async grantMinter(@Body() dto: GrantRoleDto) {
    const res = await this.token.grantMinter({
      contractAddress: dto.contractAddress,
      account: dto.account,
    });
    return { Success: true, data: res };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post("roles/transferer/grant")
  @ApiOperation({ summary: "Grant TRANSFER_ROLE to an address" })
  async grantTransferer(@Body() dto: GrantRoleDto) {
    const res = await this.token.grantTransferer({
      contractAddress: dto.contractAddress,
      account: dto.account,
    });
    return { Success: true, data: res };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":contractAddress/balance/:account")
  @ApiOperation({ summary: "Get ERC20 balanceOf for an account" })
  async balanceOf(
    @Param("contractAddress") contractAddress: string,
    @Param("account") account: string,
  ) {
    const bal = await this.token.balanceOf({ contractAddress, account });
    return { Success: true, data: { balance: bal.toString() } };
  }
}
