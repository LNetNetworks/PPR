import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../../domain/tasks/task.repository";
import { Task } from "../../../domain/tasks/task.entity";
import { CreateTaskInput } from "../../tasks/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly repo: TaskRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const nextNumber = await this.seq.next("Tasks");
    const id_task = `tsk_${String(nextNumber).padStart(3, "0")}`;

    const task = new Task(id_task, input.name_task);
    return this.repo.save(task);
  }
}
