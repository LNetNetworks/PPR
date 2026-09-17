import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true, unique: true })
  id_task: string;

  @Prop({ required: true })
  name_task: string;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
