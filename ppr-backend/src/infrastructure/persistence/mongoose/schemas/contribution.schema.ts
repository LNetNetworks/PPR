import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";
import { PhaseProject } from "./phase-project.schema";

@Schema({ timestamps: true })
export class Contribution extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_contribution: string;

  @Prop({ required: true })
  id_project: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project?: Types.ObjectId;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user?: Types.ObjectId;

  @Prop({ required: true })
  deposit_amount: number;

  @Prop({ required: true })
  id_phase_project: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProject.name })
  phase_project?: Types.ObjectId;

  @Prop({ required: true })
  date_contribution: Date;
}
export const ContributionSchema = SchemaFactory.createForClass(Contribution);
