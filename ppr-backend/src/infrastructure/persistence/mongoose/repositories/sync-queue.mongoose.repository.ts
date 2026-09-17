import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SyncJob, SyncJobDocument } from "../schemas/sync-job.schema";
import {
  SyncTask,
  SyncTaskDocument,
  SyncTaskStatus,
} from "../schemas/sync-task.schema";
import { randomUUID } from "crypto";

@Injectable()
export class SyncQueueMongooseRepository {
  private readonly attempts: number;

  constructor(
    @InjectModel(SyncJob.name)
    private readonly jobModel: Model<SyncJobDocument>,
    @InjectModel(SyncTask.name)
    private readonly taskModel: Model<SyncTaskDocument>,
  ) {
    this.attempts = 3;
  }

  async createJob(input: { requestedBy: string; type: string; total: number }) {
    const jobId = `job_${randomUUID()}`;
    await this.jobModel.create({
      jobId,
      requestedBy: input.requestedBy,
      type: input.type,
      status: "PENDING",
      progress: { total: input.total, processed: 0, ok: 0, failed: 0 },
    });
    return { jobId };
  }

  async bulkCreateTasks(input: {
    jobId: string;
    type: string;
    tasks: Array<{ dedupeKey: string; payload: any }>;
  }): Promise<{ inserted: number }> {
    if (!input.tasks?.length) return { inserted: 0 };

    const docs = input.tasks.map((t) => ({
      jobId: input.jobId,
      type: input.type,
      status: "PENDING" as SyncTaskStatus,
      attempts: 0,
      nextRunAt: new Date(),
      dedupeKey: t.dedupeKey,
      payload: t.payload,
    }));

    try {
      const res = await this.taskModel.insertMany(docs, { ordered: false });
      return { inserted: res.length };
    } catch (e: any) {
      console.error(JSON.stringify(e));
      return { inserted: 0 };
    }
  }

  async lockNextBatch(input: {
    type: string;
    limit: number;
    workerId: string;
    lockSeconds: number;
  }) {
    const now = new Date();
    const lockExpiresAt = new Date(now.getTime() + input.lockSeconds * 1000);

    const locked: SyncTaskDocument[] = [];

    for (let i = 0; i < input.limit; i++) {
      const doc = await this.taskModel.findOneAndUpdate(
        {
          type: input.type,
          status: { $in: ["PENDING", "RETRY"] },
          nextRunAt: { $lte: now },
          attempts: { $lt: this.attempts },
          $or: [
            { lockedBy: { $exists: false } },
            { lockedBy: null },
            { lockExpiresAt: { $exists: false } },
            { lockExpiresAt: null },
            { lockExpiresAt: { $lte: now } },
          ],
        },
        {
          $set: {
            status: "RUNNING",
            lockedBy: input.workerId,
            lockExpiresAt,
          },
        },
        { sort: { nextRunAt: 1, createdAt: 1 }, new: true },
      );

      if (!doc) break;
      locked.push(doc);
    }

    return locked.map((d) => ({
      id: String(d._id),
      jobId: d.jobId,
      type: d.type,
      status: d.status,
      attempts: d.attempts,
      payload: d.payload,
    }));
  }

  async markDone(input: {
    taskId: string;
    workerId: string;
    result?: SyncTask["result"];
  }) {
    await this.taskModel.updateOne(
      { _id: input.taskId, lockedBy: input.workerId },
      {
        $set: { status: "DONE", result: input.result },
        $unset: { lockedBy: 1, lockExpiresAt: 1 },
      },
    );
  }

  async markRetryOrFail(input: {
    taskId: string;
    workerId: string;
    error: string;
  }): Promise<"RETRY" | "FAILED" | undefined> {
    const task = await this.taskModel.findOne({
      _id: input.taskId,
      lockedBy: input.workerId,
    });

    if (!task) return;

    const attempts = (task.attempts ?? 0) + 1;
    const delayMs = attempts === 1 ? 30_000 : attempts === 2 ? 2 * 60_000 : 0;
    if (attempts >= this.attempts) {
      await this.taskModel.updateOne(
        { _id: input.taskId, lockedBy: input.workerId },
        {
          $set: { status: "FAILED", attempts, lastError: input.error },
          $unset: { lockedBy: 1, lockExpiresAt: 1 },
        },
      );
      return "FAILED";
    }

    await this.taskModel.updateOne(
      { _id: input.taskId, lockedBy: input.workerId },
      {
        $set: {
          status: "RETRY",
          attempts,
          lastError: input.error,
          nextRunAt: new Date(Date.now() + delayMs),
        },
        $unset: { lockedBy: 1, lockExpiresAt: 1 },
      },
    );
    return "RETRY";
  }

  async bumpJobProgress(input: {
    jobId: string;
    processed: number;
    ok: number;
    failed: number;
  }) {
    await this.jobModel.updateOne(
      { jobId: input.jobId },
      {
        $inc: {
          "progress.processed": input.processed,
          "progress.ok": input.ok,
          "progress.failed": input.failed,
        },
        $set: { status: "RUNNING" },
      },
    );
  }

  async finalizeJobIfDone(input: { jobId: string }) {
    const job = await this.jobModel.findOne({ jobId: input.jobId });
    if (!job) return;

    const remaining = await this.taskModel.countDocuments({
      jobId: input.jobId,
      status: { $in: ["PENDING", "RETRY", "RUNNING"] },
    });

    if (remaining !== 0) return;

    const failedTasks = await this.taskModel.countDocuments({
      jobId: input.jobId,
      status: "FAILED",
    });

    await this.jobModel.updateOne(
      { jobId: input.jobId },
      { $set: { status: failedTasks > 0 ? "FAILED" : "DONE" } },
    );
  }

  async getJob(jobId: string) {
    return this.jobModel.findOne({ jobId }).lean();
  }
}
