import { Injectable } from "@nestjs/common";
import { QueueRepositoryPort } from "../port/queue.repository.port";

@Injectable()
export class EnqueueJobUseCase {
  constructor(private readonly queue: QueueRepositoryPort) {}

  async execute(input: { requestedBy: string; type: string; total: number }) {
    return this.queue.createJob(input);
  }
}
