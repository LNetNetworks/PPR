import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SyncJobDocument = SyncJob & Document;
export type SyncJobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

@Schema({ timestamps: true, collection: "sync_jobs" })
export class SyncJob {
  @Prop({ required: true, unique: true })
  jobId!: string;

  @Prop({ required: true })
  requestedBy!: string;

  @Prop({ required: true, default: "PENDING" })
  status!: SyncJobStatus;

  @Prop({
    type: Object,
    default: { total: 0, processed: 0, ok: 0, failed: 0 },
  })
  progress!: { total: number; processed: number; ok: number; failed: number };

  @Prop()
  lastError?: string;
}

export const SyncJobSchema = SchemaFactory.createForClass(SyncJob);
