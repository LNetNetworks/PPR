import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Permission } from "./permission.schema";
import { UserRole } from "../../../../domain/users/user-role.enum";

@Schema({ timestamps: true })
export class PermissionRole extends Document {
  @Prop({ required: true, unique: true })
  id_permission_role: string;

  @Prop({ required: true })
  id_permission: string;

  @Prop({ type: Types.ObjectId, ref: Permission.name })
  permission: Types.ObjectId;

  @Prop({ required: true })
  role: UserRole;
}
export const PhaseProjectSchema = SchemaFactory.createForClass(PermissionRole);
