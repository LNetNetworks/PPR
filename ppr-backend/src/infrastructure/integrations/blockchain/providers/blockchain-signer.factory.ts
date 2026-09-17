import { Signer } from "ethers";

export abstract class BlockchainSignerFactory {
  abstract getSigner(): Signer;
  abstract getSignerCustomPk(privateKey): Signer;
}
