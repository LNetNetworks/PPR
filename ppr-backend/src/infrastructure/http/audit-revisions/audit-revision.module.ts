import { Module } from "@nestjs/common";
import { AuditRevisionsController } from "../controllers/audit-revision.controller";
import { CreateAuditRevisionUseCase } from "../../../application/audit-revisions/use-cases/create-audit-revision.usecase";
import { UpdateAuditRevisionUseCase } from "../../../application/audit-revisions/use-cases/update-audit-revision.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { ProjectMongooseRepository } from "../../persistence/mongoose/repositories/project.mongoose.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectMongooseRepository } from "../../persistence/mongoose/repositories/phase-project.mongoose.repository";
import { PhaseProjectTaskMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/phase-project-task.mongoose.repository";
import { AuditRevisionMongooseRepository } from "../../persistence/mongoose/repositories/audit-revision.mongoose.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { EvidenceMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/evidence.mongoose.repository";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { ContributionMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/contribution.mongoose.repository";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [AuditRevisionsController],
  providers: [
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
    CreateAuditRevisionUseCase,
    UpdateAuditRevisionUseCase,
    {
      provide: PhaseProjectRepository,
      useExisting: PhaseProjectMongooseRepository,
    },
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
    {
      provide: AuditRevisionRepository,
      useExisting: AuditRevisionMongooseRepository,
    },
    {
      provide: PhaseProjectTaskRepository,
      useExisting: PhaseProjectTaskMongooseRepository,
    },
    {
      provide: EvidenceRepository,
      useExisting: EvidenceMongooseRepository,
    },
    {
      provide: ContributionRepository,
      useExisting: ContributionMongooseRepository,
    },
  ],
})
export class AuditRevisionsModule {}
