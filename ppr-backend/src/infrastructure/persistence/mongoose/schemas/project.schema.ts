import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ProjectStatus } from "../../../../domain/projects/project-status.enum";
import { Organization } from "./organization.schema";
import { ProjectTypes } from "../../../../domain/projects/project-types.enum";
import { ProjectPaises } from "../../../../domain/projects/project-paises.enum";
import { AssetTokenSymbol } from "../../../../domain/projects/project-asset-token.enum";
import { TypeCurrency } from "../../../../domain/projects/project-type-currency.enum";

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_project: string;

  @Prop({ enum: Object.values(ProjectTypes), default: ProjectTypes.EDUCATION })
  type_project: ProjectTypes;

  @Prop({ required: true })
  date_start: Date;

  @Prop({ required: true })
  name_project: string;

  @Prop({ required: true })
  id_organization: string;

  @Prop({ type: Types.ObjectId, ref: Organization.name })
  organization?: Types.ObjectId;

  @Prop({ enum: Object.values(ProjectPaises), default: ProjectPaises.REGIONAL })
  country_region: ProjectPaises;

  @Prop({ enum: Object.values(ProjectStatus), default: ProjectStatus.PENDING })
  status: ProjectStatus;

  @Prop({ required: true })
  date_end: Date;

  @Prop()
  description?: string;

  @Prop({ type: Number, min: 0 })
  total_contributed_amount?: number;

  @Prop()
  wallet_provider?: string;

  @Prop()
  wallet_token?: string;

  @Prop()
  wallet_index_token?: string;

  @Prop({
    enum: Object.values(AssetTokenSymbol),
    default: AssetTokenSymbol.USDC,
  })
  asset_token: AssetTokenSymbol;
  type_currency: TypeCurrency;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);
