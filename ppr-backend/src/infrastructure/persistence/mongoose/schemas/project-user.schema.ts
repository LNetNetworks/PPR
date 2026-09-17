import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class ProjectUser extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_project_user: string;

  @Prop({ required: true })
  id_project: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project: Types.ObjectId;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;
}
export const ProjectUserSchema = SchemaFactory.createForClass(ProjectUser);
