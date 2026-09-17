import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Task as TaskDoc } from "../schemas/task.schema";
import { TaskRepository } from "../../../../domain/tasks/task.repository";
import { Task as TaskEntity } from "../../../../domain/tasks/task.entity";

@Injectable()
export class TaskMongooseRepository extends TaskRepository {
  constructor(
    @InjectModel(TaskDoc.name) private readonly model: Model<TaskDoc>,
  ) {
    super();
  }

  async save(entity: TaskEntity): Promise<TaskEntity> {
    await this.model.updateOne({ id_task: entity.id_task }, entity, {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    return entity;
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const doc = await this.model.findOne({ id_task: id }).lean();
    return doc ? new TaskEntity(doc.id_task, doc.name_task) : null;
  }

  async findAll(params: {
    idtask?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<TaskEntity[]> {
    const q: any = {};
    if (params.idtask) q.id_task = params.idtask;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map((doc) => new TaskEntity(doc.id_task, doc.name_task));
  }
}
