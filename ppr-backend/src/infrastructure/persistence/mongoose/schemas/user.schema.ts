import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserRole } from "../../../../domain/users/user-role.enum";
import { Organization } from "./organization.schema";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_user: string;

  @Prop({ required: true })
  id_organization: string;

  @Prop({ type: Types.ObjectId, ref: Organization.name })
  organization: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true })
  address_street: string;

  @Prop({ required: true })
  address_number: string;

  @Prop({ required: true })
  address_state: string;

  @Prop({ required: true })
  address_country: string;

  @Prop({ required: true, unique: true })
  user_email: string;

  @Prop({ required: true })
  phone_mobile: string;

  @Prop({ required: true })
  active: boolean;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @Prop()
  address_seed_token?: string;

  @Prop()
  wallet_address_token?: string;

  @Prop()
  did_user?: string;

  @Prop({ index: true, unique: true, sparse: true })
  keycloak_sub?: string;

  @Prop()
  apikeypok?: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
