import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AssetToken as AssetDoc } from "../schemas/asset-token.schema";
import { AssetRepository } from "../../../../domain/asset-token/asset-token.repository";
import { AssetToken as AssetEntity } from "../../../../domain/asset-token/asset-token.entity";

@Injectable()
export class AssetMongooseRepository extends AssetRepository {
  constructor(
    @InjectModel(AssetDoc.name)
    private readonly model: Model<AssetDoc>,
  ) {
    super();
  }

  async save(entity: AssetEntity): Promise<AssetEntity> {
    await this.model.updateOne({ symbol: entity.symbol }, entity, {
      upsert: true,
    });
    return entity;
  }

  async findById(id: string): Promise<AssetEntity | null> {
    const doc = await this.model.findById(id).lean();
    return doc
      ? new AssetEntity(
          doc.symbol,
          doc.name,
          doc.category,
          doc.contract_address,
          doc.decimals,
          doc.is_active,
        )
      : null;
  }

  async findBySymbol(symbol: string): Promise<AssetEntity | null> {
    const doc = await this.model
      .findOne({ symbol: symbol.toUpperCase() })
      .lean();
    return doc
      ? new AssetEntity(
          doc.symbol,
          doc.name,
          doc.category,
          doc.contract_address,
          doc.decimals,
          doc.is_active,
        )
      : null;
  }

  async findAll(params: {
    category?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AssetEntity[]> {
    const q: any = {};
    if (params.category) q.category = params.category;
    if (params.isActive !== undefined) q.is_active = params.isActive;

    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();

    return docs.map(
      (doc) =>
        new AssetEntity(
          doc.symbol,
          doc.name,
          doc.category,
          doc.contract_address,
          doc.decimals,
          doc.is_active,
        ),
    );
  }

  async update(
    id: string,
    data: Partial<AssetEntity>,
  ): Promise<AssetEntity | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean();

    return doc
      ? new AssetEntity(
          doc.symbol,
          doc.name,
          doc.category,
          doc.contract_address,
          doc.decimals,
          doc.is_active,
        )
      : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async findByContractAddress(address: string): Promise<AssetEntity | null> {
    const doc = await this.model.findOne({ contract_address: address }).lean();
    return doc
      ? new AssetEntity(
          doc.symbol,
          doc.name,
          doc.category,
          doc.contract_address,
          doc.decimals,
          doc.is_active,
        )
      : null;
  }
}
