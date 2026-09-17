import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Permission } from "./permission.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class PermissionUserAdittional extends Document {
  @Prop({ required: true, unique: true })
  id_permission_user_adittional: string;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true })
  id_permission: string;

  @Prop({ type: Types.ObjectId, ref: Permission.name })
  permission: Types.ObjectId;

  @Prop({ required: true })
  type: boolean;
}
export const PermissionUserAdittionalSchema = SchemaFactory.createForClass(
  PermissionUserAdittional,
);
