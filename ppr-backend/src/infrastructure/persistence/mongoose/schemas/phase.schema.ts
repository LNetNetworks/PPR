import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Phase extends Document {
  @Prop({ required: true, unique: true })
  id_phase: string;

  @Prop({ required: true })
  name_phase: string;

  @Prop({ required: true })
  brief_description?: string;
}
export const PhaseSchema = SchemaFactory.createForClass(Phase);
