import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";
import { EvidenceStatus } from "../../../../domain/evidences/evidence-status.enum";
import { PhaseProject } from "./phase-project.schema";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Evidence extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_evidence!: string;

  @Prop({ required: true })
  id_project!: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project: Types.ObjectId;

  @Prop({ required: true })
  id_user!: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true })
  file_name!: string;

  @Prop({ required: true })
  uri!: string;

  @Prop({ enum: Object.values(EvidenceStatus), default: EvidenceStatus.EMPTY })
  status: EvidenceStatus;

  @Prop()
  tx_hash?: string;

  @Prop()
  id_phase_project?: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProject.name })
  phase_project?: Types.ObjectId;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
