import { Task } from "./task.entity";

export abstract class TaskRepository {
  abstract save(phase: Task): Promise<Task>;
  abstract findById(id: string): Promise<Task | null>;
  abstract findAll(params: {
    idTask?: string;
    limit?: number;
    offset?: number;
  }): Promise<Task[]>;
}
