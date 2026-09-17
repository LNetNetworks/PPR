import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class AssetToken extends Document {
  @Prop({ required: true, unique: true, index: true })
  symbol: string; // Example: 'USDC', 'USDT', 'PPR' (tu token)

  @Prop({ required: true })
  name: string; // Example: 'USD Coin', 'PPR Token'

  @Prop({ required: true, enum: ["STABLECOIN", "NATIVE", "UTILITY"] })
  category: string;

  @Prop({ required: true })
  contract_address: string;

  @Prop({ required: true, default: 18 })
  decimals: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  logo_url?: string;
}

export const AssetTokenSchema = SchemaFactory.createForClass(AssetToken);
