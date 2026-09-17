import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongoosePersistenceModule } from "../persistence/mongoose/mongoose.module";
import { HttpAxiosModule } from "../integrations/http-axios.module";

import { QueueRunner } from "./queue.runner";
import { PokTitlesSyncProcessor } from "./processors/pok-titles-sync.processor";
import { QueueProcessorsRegistry } from "./processors/queue-processor.registry";
import { ProjectBridgeDepositProcessor } from "./processors/project-bridge-deposit.processor";
import { ProjectBridgeWithdrawProcessor } from "./processors/project-bridge-withdraw.processor";

import { QueueRepositoryPort } from "../../application/queue/port/queue.repository.port";
import { SyncQueueMongooseRepository } from "../persistence/mongoose/repositories/sync-queue.mongoose.repository";
import { BridgeModule } from "../integrations/bridge/bridge.module";
import { BlockchainIntegrationModule } from "../integrations/blockchain/blockchain.module";

import { EnsurePokUserUseCase } from "../../application/users/use-cases/ensure-user.usecase";
import { CreateUserUseCase } from "../../application/users/use-cases/create-user.usecase";
import { PokModule } from "../integrations/pok/pok.module";
import { EvidencesModule } from "../http/evidences/evidences.module";
import { ProjectsModule } from "../http/projects/projects.module";

import { ProjectUserMongooseRepository } from "../persistence/mongoose/repositories/project-user.mongoose.repository";
import { ProjectUserRepository } from "../../domain/projects/project-user.repository";
import { ProjectMongooseRepository } from "../persistence/mongoose/repositories/project.mongoose.repository";
import { ProjectRepository } from "../../domain/projects/project.repository";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongoosePersistenceModule,
    HttpAxiosModule,
    PokModule,
    BridgeModule,
    BlockchainIntegrationModule,
    EvidencesModule,
    ProjectsModule,
  ],
  providers: [
    QueueRunner,
    QueueProcessorsRegistry,
    PokTitlesSyncProcessor,
    ProjectBridgeDepositProcessor,
    ProjectBridgeWithdrawProcessor,
    EnsurePokUserUseCase,
    CreateUserUseCase,
    { provide: QueueRepositoryPort, useExisting: SyncQueueMongooseRepository },
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
    {
      provide: ProjectUserRepository,
      useExisting: ProjectUserMongooseRepository,
    },
  ],
})
export class WorkersModule {}
