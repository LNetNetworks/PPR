import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  id_permission: string;

  @Prop({ required: true })
  name_permission: string;

  @Prop({ required: true })
  description_permission: string;
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);
