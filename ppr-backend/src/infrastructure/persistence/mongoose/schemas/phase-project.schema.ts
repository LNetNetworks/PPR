import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { Phase } from "./phase.schema";

@Schema({ timestamps: true })
export class PhaseProject extends Document {
  @Prop({ required: true, unique: true })
  id_phase_project: string;

  @Prop({ required: true })
  id_project: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project: Types.ObjectId;

  @Prop({ required: true })
  id_phase: string;

  @Prop({ type: Types.ObjectId, ref: Phase.name })
  phase?: Types.ObjectId;

  @Prop({ required: true })
  require_evidence: boolean;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  stage_weight: number;

  @Prop({ required: true })
  contribution_required: number;

  @Prop({ required: true })
  contribution_received: number;

  @Prop({ required: true })
  date_start: Date;

  @Prop({ required: true })
  date_end: Date;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  require_auditory: boolean;

  @Prop({ required: true })
  require_contribution: boolean;

  @Prop({ required: true })
  close_auditory: boolean;

  @Prop({ required: true })
  close_contribution: boolean;

  @Prop({ required: true })
  close_evidence: boolean;

  @Prop({ required: true })
  description: string;
}
export const PhaseProjectSchema = SchemaFactory.createForClass(PhaseProject);
