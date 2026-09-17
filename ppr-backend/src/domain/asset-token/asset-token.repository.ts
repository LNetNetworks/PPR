import { AssetToken } from "./asset-token.entity";

export abstract class AssetRepository {
  abstract save(asset: AssetToken): Promise<AssetToken>;

  abstract findById(id: string): Promise<AssetToken | null>;

  abstract findAll(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<AssetToken[]>;

  abstract findBySymbol(symbol: string): Promise<AssetToken | null>;

  abstract findByContractAddress(address: string): Promise<AssetToken | null>;

  abstract update(
    id: string,
    data: Partial<AssetToken>,
  ): Promise<AssetToken | null>;

  abstract delete(id: string): Promise<void>;
}
