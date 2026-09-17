import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LacchainProvider, LacchainSigner } from "@lacchain/gas-model-provider";

import { BlockchainSignerFactory } from "./blockchain-signer.factory";

@Injectable()
export class LacchainSignerFactory extends BlockchainSignerFactory {
  private signer: LacchainSigner | null = null;

  constructor(private readonly config: ConfigService) {
    super();
  }

  private get gasExpirationMs(): number {
    return this.config.getOrThrow<number>("blockchain.gasExpiration");
  }

  getSigner() {
    const now = new Date();
    const rpc = this.config.get<string>("blockchain.url")!;
    const pk = this.config.get<string>("blockchain.privateKey")!;
    const gasNode = this.config.get<string>("blockchain.gasNodeAddress") || "";
    const gasExp = now.getTime() + this.gasExpirationMs;
    const signer = new LacchainSigner(
      pk,
      new LacchainProvider(rpc),
      gasNode,
      gasExp,
    );
    return signer;
  }

  getSignerCustomPk(privateKey) {
    const now = new Date();
    const rpc = this.config.get<string>("blockchain.url")!;
    const gasNode = this.config.get<string>("blockchain.gasNodeAddress") || "";
    const gasExp = now.getTime() + this.gasExpirationMs;
    const signer = new LacchainSigner(
      privateKey,
      new LacchainProvider(rpc),
      gasNode,
      gasExp,
    );
    return signer;
  }
}
