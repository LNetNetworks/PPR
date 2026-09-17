export class AssetToken {
  constructor(
    public readonly symbol: string,
    public name: string,
    public category: string,
    public contract_address: string,
    public decimals: number,
    public is_active: boolean,
    public readonly id_asset?: string,
  ) {}
}
