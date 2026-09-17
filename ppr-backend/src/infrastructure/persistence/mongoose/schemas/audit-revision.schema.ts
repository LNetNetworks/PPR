import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";
import { PhaseProject } from "./phase-project.schema";
import { AuditStatus } from "../../../../domain/audit-revisions/audit-revision-status.enum";

@Schema({ timestamps: true })
export class AuditRevision extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_revision: string;

  @Prop({ required: true })
  objetive: string;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true })
  id_project: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project: Types.ObjectId;

  @Prop({ required: true })
  observation: string;

  @Prop()
  date_revision: Date;

  @Prop({ required: true })
  id_phase_project: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProject.name })
  phase_project?: Types.ObjectId;

  @Prop({ enum: Object.values(AuditStatus), default: AuditStatus.PLANNED })
  status: AuditStatus;
}
export const AuditRevisionSchema = SchemaFactory.createForClass(AuditRevision);
