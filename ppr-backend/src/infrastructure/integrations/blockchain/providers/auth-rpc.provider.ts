import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider, Wallet } from "ethers";
import { KeycloakAuthTokenService } from "../auth/keycloak-auth-token.service";
import { configureEthersAuthInterceptor } from "../ethers-auth.interceptor";
import { BlockchainSignerFactory } from "./blockchain-signer.factory";

@Injectable()
export class AuthRpcProviderFactory extends BlockchainSignerFactory {
  private provider: JsonRpcProvider | null = null;
  private signer: Wallet | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly tokenService: KeycloakAuthTokenService,
  ) {
    super();
    configureEthersAuthInterceptor(this.tokenService);
  }

  getProvider(): JsonRpcProvider {
    if (!this.provider) {
      const rpcUrl = this.config.getOrThrow<string>(
        "blockchain.zk_rpc_node_url",
      );
      this.provider = new JsonRpcProvider(rpcUrl);
    }
    return this.provider;
  }

  getSigner(): Wallet {
    if (!this.signer) {
      const privateKey = this.config.getOrThrow<string>(
        "blockchain.zk_user_private_key",
      );
      this.signer = new Wallet(privateKey, this.getProvider());
    }
    return this.signer;
  }

  getSignerCustomPk(privateKey): Wallet {
    if (!this.signer) {
      this.signer = new Wallet(privateKey, this.getProvider());
    }
    return this.signer;
  }
}
