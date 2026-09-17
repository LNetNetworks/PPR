import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueRepositoryPort } from "../../application/queue/port/queue.repository.port";
import { QueueProcessorsRegistry } from "../workers/processors/queue-processor.registry";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class QueueRunner {
  private readonly workerId = `worker_${process.pid}`;

  constructor(
    private readonly config: ConfigService,
    private readonly queue: QueueRepositoryPort,
    private readonly registry: QueueProcessorsRegistry,
  ) {}

  @Cron("*/20 * * * * *")
  async tick() {
    const batchSize = Number(3);
    const lockSeconds = Number(120);
    const concurrency = Number(1);
    console.log("[QueueRunner] tick", new Date().toISOString());

    for (const p of this.registry.getAll()) {
      const tasks = await this.queue.lockNextBatch({
        type: p.type,
        limit: batchSize,
        workerId: this.workerId,
        lockSeconds,
      });

      if (tasks[0]) console.log("[QueueRunner] locked sample", tasks[0]);
      if (!tasks.length) continue;

      for (let i = 0; i < tasks.length; i += concurrency) {
        const chunk = tasks.slice(i, i + concurrency);

        await Promise.allSettled(
          chunk.map(async (t) => {
            try {
              console.log("[QueueRunner] calling processor", t.id);

              const result = await p.process({
                id: t.id,
                jobId: t.jobId,
                payload: t.payload,
              });

              await this.queue.markDone({
                taskId: t.id,
                workerId: this.workerId,
                result,
              });

              try {
                await this.queue.bumpJobProgress({
                  jobId: t.jobId,
                  processed: 1,
                  ok: 1,
                  failed: 0,
                });
              } catch (e: any) {
                console.error(
                  "[QueueRunner] bumpJobProgress failed after task success",
                  e?.message,
                );
              }
            } catch (e: any) {
              let finalStatus: "RETRY" | "FAILED" | undefined;

              try {
                finalStatus = await this.queue.markRetryOrFail({
                  taskId: t.id,
                  workerId: this.workerId,
                  error: e?.message ?? "error",
                });
              } catch (marError: any) {
                console.error(
                  "[QueueRunner] markRetryOrFail failed",
                  marError?.message,
                );
              }

              try {
                await this.queue.bumpJobProgress({
                  jobId: t.jobId,
                  processed: 1,
                  ok: 0,
                  failed: finalStatus === "FAILED" ? 1 : 0,
                });
              } catch (bumError: any) {
                console.error(
                  "[QueueRunner] bumpJobProgress failed after task failure",
                  bumError?.message,
                );
              }
            }
          }),
        );
        console.log("[QueueRunner] chunk finished at offset", i);
      }

      const jobIds = [...new Set(tasks.map((t) => t.jobId))];
      for (const jobId of jobIds) await this.queue.finalizeJobIfDone({ jobId });
    }
  }
}
