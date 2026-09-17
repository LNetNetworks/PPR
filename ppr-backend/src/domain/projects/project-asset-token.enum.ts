export enum AssetTokenSymbol {
  TOKEN = "TOKEN",
  USDC = "USDC",
}

export const AssetTokenMetadata = {
  [AssetTokenSymbol.TOKEN]: {
    name: "Token Native",
    decimals: 18,
    contractAddress: "0x123...",
  },
  [AssetTokenSymbol.USDC]: {
    name: "USD Coin",
    decimals: 6,
    contractAddress: "0x456...",
  },
};
