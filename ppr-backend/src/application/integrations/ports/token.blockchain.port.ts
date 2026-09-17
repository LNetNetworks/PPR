export abstract class TokenBlockchainPort {
  abstract deployToken(input: {
    name: string;
    symbol: string;
  }): Promise<{ address: string; hash: string }>;

  abstract mint(input: {
    contractAddress: string;
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string; uidHash: string; contextHash: string }>;

  abstract grantMinter(input: {
    contractAddress: string;
    account: string;
  }): Promise<{ txHash: string }>;
  abstract grantTransferer(input: {
    contractAddress: string;
    account: string;
  }): Promise<{ txHash: string }>;
  abstract balanceOf(input: {
    contractAddress: string;
    account: string;
  }): Promise<bigint>;
  abstract transfer(input: {
    contractAddress: string;
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string }>;
  abstract transferNative(input: {
    to: string;
    amount: bigint;
    uid: string;
    context: string;
    privateKey: string;
  }): Promise<{ txHash: string }>;
  abstract canTransfer(input: {
    contractAddress: string;
    account: string;
  }): Promise<boolean>;
  abstract canMint(input: {
    contractAddress: string;
    account: string;
  }): Promise<boolean>;
  abstract balanceNativeOf(input: { account: string }): Promise<bigint>;
}
