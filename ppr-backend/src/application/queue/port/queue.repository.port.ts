export type QueueJobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";
export type QueueTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "DONE"
  | "RETRY"
  | "FAILED";

export type QueueTaskPayload = Record<string, any>;

export interface QueueTask {
  id: string;
  jobId: string;
  type: string;
  status: QueueTaskStatus;
  attempts: number;
  payload: QueueTaskPayload;
}

export abstract class QueueRepositoryPort {
  abstract createJob(input: {
    requestedBy: string;
    type: string;
    total: number;
  }): Promise<{ jobId: string }>;

  abstract bulkCreateTasks(input: {
    jobId: string;
    type: string;
    tasks: Array<{ dedupeKey: string; payload: QueueTaskPayload }>;
  }): Promise<{ inserted: number }>;

  abstract lockNextBatch(input: {
    type: string;
    limit: number;
    workerId: string;
    lockSeconds: number;
  }): Promise<QueueTask[]>;

  abstract markDone(input: {
    taskId: string;
    workerId: string;
    result?: any;
  }): Promise<void>;

  abstract markRetryOrFail(input: {
    taskId: string;
    workerId: string;
    error: string;
  }): Promise<"RETRY" | "FAILED" | undefined>;
  abstract bumpJobProgress(input: {
    jobId: string;
    processed: number;
    ok: number;
    failed: number;
  }): Promise<void>;

  abstract finalizeJobIfDone(input: { jobId: string }): Promise<void>;

  abstract getJob(jobId: string): Promise<any>;
}
