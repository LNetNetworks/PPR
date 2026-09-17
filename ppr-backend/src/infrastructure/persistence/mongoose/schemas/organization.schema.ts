import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_organization: string;

  @Prop({ required: true })
  name_organization: string;

  @Prop({ required: true })
  date_registration: Date;

  @Prop()
  address_organization?: string;
  @Prop()
  did_organization?: string;
}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
