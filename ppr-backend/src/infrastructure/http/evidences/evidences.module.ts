import { Module } from "@nestjs/common";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { EvidencesController } from "../controllers/evidences.controller";
import { CreateEvidenceUseCase } from "../../../application/evidences/use-cases/create-evidence.usecase";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { EvidenceMongooseRepository } from "../../persistence/mongoose/repositories/evidence.mongoose.repository";
import { StorageModule } from "../../integrations/storage/storage.module";
import { BlockchainIntegrationModule } from "../../integrations/blockchain/blockchain.module";
import { PhaseProjectTaskMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/phase-project-task.mongoose.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { AuditRevisionMongooseRepository } from "../../persistence/mongoose/repositories/audit-revision.mongoose.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { ContributionMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/contribution.mongoose.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";

@Module({
  imports: [
    MongoosePersistenceModule,
    StorageModule,
    BlockchainIntegrationModule,
  ],
  controllers: [EvidencesController],
  providers: [
    CreateEvidenceUseCase,
    EvidenceMongooseRepository,
    { provide: EvidenceRepository, useExisting: EvidenceMongooseRepository },
    {
      provide: PhaseProjectTaskRepository,
      useExisting: PhaseProjectTaskMongooseRepository,
    },
    {
      provide: AuditRevisionRepository,
      useExisting: AuditRevisionMongooseRepository,
    },
    {
      provide: ContributionRepository,
      useExisting: ContributionMongooseRepository,
    },
  ],
  exports: [CreateEvidenceUseCase, EvidenceRepository],
})
export class EvidencesModule {}
