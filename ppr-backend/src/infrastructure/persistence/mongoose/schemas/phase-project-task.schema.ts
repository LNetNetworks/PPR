import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { PhaseProject } from "./phase-project.schema";
import { Task } from "./task.schema";
import { PhaseProjectTaskStatus } from "../../../../domain/phases/phase-project-task-status.enum";

@Schema({ timestamps: true })
export class PhaseProjectTask extends Document {
  @Prop({ required: true, unique: true })
  id_phase_project_task: string;

  @Prop({ required: true })
  id_phase_project: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProject.name })
  phase_project: Types.ObjectId;

  @Prop({ required: true })
  id_task: string;

  @Prop({ type: Types.ObjectId, ref: Task.name })
  task: Types.ObjectId;

  @Prop({
    enum: Object.values(PhaseProjectTaskStatus),
    default: PhaseProjectTaskStatus.PENDING,
  })
  status_task: PhaseProjectTaskStatus;
}
export const PhaseProjectTaskSchema =
  SchemaFactory.createForClass(PhaseProjectTask);
