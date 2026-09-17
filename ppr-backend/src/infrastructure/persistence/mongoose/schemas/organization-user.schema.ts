import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Organization } from "./organization.schema";
import { User } from "./user.schema";
import { UserRole } from "../../../../domain/users/user-role.enum";

@Schema({ timestamps: true })
export class OrganizationUser extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_organization_user: string;

  @Prop({ required: true })
  id_organization: string;

  @Prop({ type: Types.ObjectId, ref: Organization.name })
  organization: Types.ObjectId;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;
}
export const OrganizationUserSchema =
  SchemaFactory.createForClass(OrganizationUser);
