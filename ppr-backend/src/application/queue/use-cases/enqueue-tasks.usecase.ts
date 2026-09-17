import { Injectable } from "@nestjs/common";
import { QueueRepositoryPort } from "../port/queue.repository.port";

@Injectable()
export class EnqueueTasksUseCase {
  constructor(private readonly queue: QueueRepositoryPort) {}

  async execute(input: {
    jobId: string;
    type: string;
    tasks: Array<{ dedupeKey: string; payload: Record<string, any> }>;
  }) {
    return this.queue.bulkCreateTasks({
      jobId: input.jobId,
      type: input.type,
      tasks: input.tasks,
    });
  }
}
