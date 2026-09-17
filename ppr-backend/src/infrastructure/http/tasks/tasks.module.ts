import { Module } from "@nestjs/common";
import { TasksController } from "../controllers/tasks.controller";
import { CreateTaskUseCase } from "../../../application/tasks/use-cases/create-task.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { TaskMongooseRepository } from "../../persistence/mongoose/repositories/task.mongoose.repository";
import { TaskRepository } from "../../../domain/tasks/task.repository";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    { provide: TaskRepository, useExisting: TaskMongooseRepository },
  ],
})
export class TasksModule {}
