import { Module } from "@nestjs/common";
import { ContributionsController } from "../controllers/contributions.controller";
import { CreateContributionUseCase } from "../../../application/contributions/use-cases/create-contribution.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { ContributionMongooseRepository } from "../../persistence/mongoose/repositories/contribution.mongoose.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { UserMongooseRepository } from "../../persistence/mongoose/repositories/user.mongoose.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { ProjectMongooseRepository } from "../../persistence/mongoose/repositories/project.mongoose.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseProjectMongooseRepository } from "../../persistence/mongoose/repositories/phase-project.mongoose.repository";
import { BlockchainIntegrationModule } from "../../integrations/blockchain/blockchain.module";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { ProjectUserMongooseRepository } from "../../persistence/mongoose/repositories/project-user.mongoose.repository";
import { PhaseProjectTaskMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/phase-project-task.mongoose.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { AuditRevisionMongooseRepository } from "../../persistence/mongoose/repositories/audit-revision.mongoose.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { EvidenceMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/evidence.mongoose.repository";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { QueueRepositoryPort } from "../../../application/queue/port/queue.repository.port";
import { SyncQueueMongooseRepository } from "../../persistence/mongoose/repositories/sync-queue.mongoose.repository";

@Module({
  imports: [
    MongoosePersistenceModule,
    BlockchainIntegrationModule,
  ],
  controllers: [ContributionsController],
  providers: [
    CreateContributionUseCase,
    {
      provide: ContributionRepository,
      useExisting: ContributionMongooseRepository,
    },
    { provide: UserRepository, useExisting: UserMongooseRepository },
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
    {
      provide: PhaseProjectRepository,
      useExisting: PhaseProjectMongooseRepository,
    },
    {
      provide: ProjectUserRepository,
      useExisting: ProjectUserMongooseRepository,
    },
    {
      provide: PhaseProjectTaskRepository,
      useExisting: PhaseProjectTaskMongooseRepository,
    },
    {
      provide: AuditRevisionRepository,
      useExisting: AuditRevisionMongooseRepository,
    },
    {
      provide: EvidenceRepository,
      useExisting: EvidenceMongooseRepository,
    },
    { provide: QueueRepositoryPort, useExisting: SyncQueueMongooseRepository },
  ],
})
export class ContributionsModule {}
