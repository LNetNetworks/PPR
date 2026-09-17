import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpAxiosModule } from "../../integrations/http-axios.module";
import { PokService } from "../pok/pok.service";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { AuthModule } from "../../../infrastructure/auth/auth.module";
import { UserMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/user.mongoose.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { UserProvisioningService } from "../../auth/user-provisioning.service";
import { SyncQueueMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/sync-queue.mongoose.repository";
import { QueueRepositoryPort } from "../../../application/queue/port/queue.repository.port";
import { GetVcsAndEnqueueTitlesSyncUseCase } from "../../../application/integrations/pok/use-cases/get-vc-and-enqueue-sync.usecase";
import { EnqueueJobUseCase } from "../../../application/queue/use-cases/enqueue-job.usecase";
import { EnqueueTasksUseCase } from "../../../application/queue/use-cases/enqueue-tasks.usecase";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { ProjectMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/project.mongoose.repository";

@Module({
  imports: [
    ConfigModule,
    HttpAxiosModule,
    MongoosePersistenceModule,
    AuthModule,
  ],
  providers: [
    PokService,
    UserProvisioningService,
    UserMongooseRepository,
    EnqueueJobUseCase,
    EnqueueTasksUseCase,
    GetVcsAndEnqueueTitlesSyncUseCase,
    { provide: UserRepository, useExisting: UserMongooseRepository },
    { provide: QueueRepositoryPort, useExisting: SyncQueueMongooseRepository },
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
  ],
  exports: [
    PokService,
    UserProvisioningService,
    GetVcsAndEnqueueTitlesSyncUseCase,
  ],
})
export class PokModule {}
