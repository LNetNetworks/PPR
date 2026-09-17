import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Contract, ContractFactory, ethers } from "ethers";
import { TokenBlockchainPort } from "../../../application/integrations/ports/token.blockchain.port";
import { BlockchainSignerFactory } from "./providers/blockchain-signer.factory";

import tokenAbi from "./abi/tokenppr.abi.json";
import tokenBytecode from "./abi/tokenppr-bytecode.json";
import tokenGasAbi from "./abi/tokenppr-gas.abi.json";
import tokenGasBytecode from "./abi/tokenppr-gas-bytecode.json";

function ensureBytes32(input: string): string {
  if (input.startsWith("0x") && input.length === 66) return input;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

function ensureAddress(addr: string): string {
  try {
    return ethers.getAddress(addr);
  } catch {
    throw new BadRequestException(`Invalid address: ${addr}`);
  }
}

@Injectable()
export class TokenBlockchainClient implements TokenBlockchainPort {
  private readonly network: string;
  private readonly trustedForwarder: string;

  constructor(
    private readonly signerFactory: BlockchainSignerFactory,
    private readonly config: ConfigService,
  ) {
    this.network = this.config.get<string>("blockchain.network")!;
    this.trustedForwarder = this.config.getOrThrow<string>(
      "blockchain.trusted_forwarder",
    );
  }

  private getAbi() {
    return this.network === "lacchain" ? tokenGasAbi : tokenAbi;
  }

  private getBytecode() {
    return this.network === "lacchain"
      ? tokenGasBytecode.bytecode
      : tokenBytecode.bytecode;
  }

  private getFactory(): ContractFactory {
    const signer = this.signerFactory.getSigner();
    return new ethers.ContractFactory(
      this.getAbi(),
      this.getBytecode(),
      signer,
    );
  }

  private getContract(address: string): Contract {
    const signer = this.signerFactory.getSigner();
    return new ethers.Contract(address, this.getAbi(), signer);
  }

  private getContractWithSigner(address: string, signer: any): Contract {
    return new ethers.Contract(address, this.getAbi(), signer);
  }

  async deployToken(input: {
    name: string;
    symbol: string;
  }): Promise<{ address: string; hash: string }> {
    let contract;
    const factory = this.getFactory();
    const signer = this.signerFactory.getSigner();
    const adminFromSigner =
      (signer as any).address ?? (await (signer as any).getAddress?.());
    const name = input.name?.trim();
    const symbol = input.symbol?.trim();
    if (!name || !symbol)
      throw new BadRequestException("ERR_DEPLOY_TOKEN: name/symbol requerido");
    const admin = ensureAddress(adminFromSigner);
    const minter = ensureAddress(adminFromSigner);
    if (this.network === "lacchain") {
      contract = await factory.deploy(
        name,
        symbol,
        admin,
        minter,
        this.trustedForwarder,
      );
    } else {
      contract = await factory.deploy(name, symbol, admin, minter);
    }

    const receipt = await contract.deploymentTransaction()?.wait();
    if (!receipt?.contractAddress || !receipt?.hash) {
      throw new BadRequestException("ERR_DEPLOY_TOKEN: empty receipt");
    }
    return { address: receipt.contractAddress, hash: receipt.hash };
  }

  async canMint(input: {
    contractAddress: string;
    account: string;
  }): Promise<boolean> {
    const c = this.getContract(ensureAddress(input.contractAddress));
    const minterRole = await c.MINTER_ROLE();
    const hasRole = (await c.hasRole(
      minterRole,
      ensureAddress(input.account),
    )) as boolean;
    return hasRole;
  }

  async canTransfer(input: { contractAddress: string; account: string }) {
    const c = this.getContract(ensureAddress(input.contractAddress));
    const role = await c.TRANSFER_ROLE();
    const hasRole = await c.hasRole(role, ensureAddress(input.account));
    return hasRole;
  }

  async grantMinter(input: {
    contractAddress: string;
    account: string;
  }): Promise<{ txHash: string }> {
    const contract = this.getContract(ensureAddress(input.contractAddress));
    const account = ensureAddress(input.account);

    return (contract as any)
      .grantMinter(account)
      .then((gmtx: any) => {
        return gmtx.wait().then(() => {
          return { txHash: gmtx.hash as string }; // Final cast to guarantee the return type
        });
      })
      .catch((err: unknown) => {
        console.error("Error in grantMinter:", err);
        throw err;
      }) as Promise<{ txHash: string }>;
  }

  async grantTransferer(input: {
    contractAddress: string;
    account: string;
  }): Promise<{ txHash: string }> {
    const contract = this.getContract(ensureAddress(input.contractAddress));
    const account = ensureAddress(input.account);

    return contract
      .grantTransferer(account)
      .then((gttx) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return gttx.wait().then((receipt) => {
          return { txHash: gttx.hash };
        });
      })
      .catch((err) => {
        console.error("Error in grantTransferer:", err);
        throw new BadRequestException("Error-Blockchain - grantTransferer");
      });
  }

  async mint(input: {
    contractAddress: string;
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string; uidHash: string; contextHash: string }> {
    const sleep = (ms: number | 1000) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const pk = input.privateKey.startsWith("0x")
      ? input.privateKey
      : `0x${input.privateKey}`;
    const to = ensureAddress(input.to);
    const amount = input.amount;
    const uidHash = ensureBytes32(input.uid);
    const contextHash = ensureBytes32(input.context);
    const signer = this.signerFactory.getSignerCustomPk(pk);
    const deployedContract = this.getContractWithSigner(
      input.contractAddress,
      signer,
    );

    const tx = await deployedContract.mint(to, amount, uidHash, contextHash);
    await sleep(3000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bal = await deployedContract.balanceOf(to);
    return { txHash: tx.hash, uidHash, contextHash };
  }

  async transfer(input: {
    contractAddress: string;
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string }> {
    const pk = input.privateKey.startsWith("0x")
      ? input.privateKey
      : `0x${input.privateKey}`;
    const projectSigner = this.signerFactory.getSignerCustomPk(pk);

    const sleep = (ms: number | 1000) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const contractAddress = ensureAddress(input.contractAddress);
    const contract = this.getContractWithSigner(contractAddress, projectSigner);
    const to = ensureAddress(input.to);
    const amount = input.amount;
    if (amount <= 0n)
      throw new BadRequestException("ERR_TRANSFER: amount must be > 0");
    const tx = await contract.transfer(to, amount);
    await sleep(3000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bal = await contract.balanceOf(to);
    return { txHash: tx.hash };
  }

  async transferNative(input: {
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string }> {
    const pk = input.privateKey.startsWith("0x")
      ? input.privateKey
      : `0x${input.privateKey}`;
    const signer = this.signerFactory.getSignerCustomPk(pk);
    const to = ensureAddress(input.to);
    const amount = input.amount;
    if (amount <= 0n) {
      throw new BadRequestException("ERR_NATIVE_TRANSFER: amount must be > 0");
    }

    const tx = await signer.sendTransaction({
      to,
      value: amount,
    });
    await tx.wait();

    const provider = signer.provider;
    if (provider) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const bal = await provider.getBalance(to);
    }

    return { txHash: tx.hash };
  }

  async balanceOf(input: {
    contractAddress: string;
    account: string;
  }): Promise<bigint> {
    const contract = this.getContract(ensureAddress(input.contractAddress));
    const account = ensureAddress(input.account);
    const bal: bigint = await contract.balanceOf(account);
    return bal;
  }

  async balanceNativeOf(input: { account: string }): Promise<bigint> {
    const signer = this.signerFactory.getSigner();
    const provider = signer.provider;
    if (!provider) {
      throw new BadRequestException("Native balance provider is unavailable");
    }
    return provider.getBalance(ensureAddress(input.account));
  }
}
