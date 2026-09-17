import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";
import { PhaseProjectTask } from "./phase-project-task.schema";
import { PhaseProject } from "./phase-project.schema";
import { TransactionTypes } from "../../../../domain/transactions/transaction-types.enum";

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, unique: true, index: true })
  id_transaction: string;

  @Prop({ required: true })
  id_project: string;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project?: Types.ObjectId;

  @Prop({ required: true })
  id_user: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true })
  result_transaction: string;

  @Prop({ required: true })
  transaction_date: Date;

  @Prop({ required: true })
  transaction_type: TransactionTypes;

  @Prop()
  id_phase_project: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProject.name })
  phase_project?: Types.ObjectId;

  @Prop()
  id_phase_project_task: string;

  @Prop({ type: Types.ObjectId, ref: PhaseProjectTask.name })
  phase_project_task?: Types.ObjectId;

  @Prop({ required: true })
  comment: string;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
