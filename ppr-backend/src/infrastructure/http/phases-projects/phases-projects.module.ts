import { Module } from "@nestjs/common";
import { PhasesProjectController } from "../controllers/phases-projects.controller";
import { CreatePhaseProjectUseCase } from "../../../application/phases/use-cases/create-phase-project.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { PhaseProjectMongooseRepository } from "../../persistence/mongoose/repositories/phase-project.mongoose.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { ProjectMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/project.mongoose.repository";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
import { PhaseMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/phase.mongoose.repository";
import { CreatePhaseProjectTaskUseCase } from "../../../application/phases/use-cases/create-phase-project-task.usecase";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { PhaseProjectTaskMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/phase-project-task.mongoose.repository";
import { TaskRepository } from "../../../domain/tasks/task.repository";
import { TaskMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/task.mongoose.repository";
import { EnsurePendingAuditRevisionPhaseService } from "../../../application/phases/use-cases/service/ensure-pending-audit-revision-phase.service";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { ProjectUserMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/project-user.mongoose.repository";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
import { AuditRevisionMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/audit-revision.mongoose.repository";
import { UserMongooseRepository } from "../../persistence/mongoose/repositories/user.mongoose.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { MailModule } from "../../../infrastructure/integrations/mail/mail.module";

@Module({
  imports: [MongoosePersistenceModule, MailModule],
  controllers: [PhasesProjectController],
  providers: [
    CreatePhaseProjectUseCase,
    CreatePhaseProjectTaskUseCase,
    EnsurePendingAuditRevisionPhaseService,
    {
      provide: PhaseProjectRepository,
      useExisting: PhaseProjectMongooseRepository,
    },
    { provide: ProjectRepository, useExisting: ProjectMongooseRepository },
    { provide: PhaseRepository, useExisting: PhaseMongooseRepository },
    {
      provide: PhaseProjectTaskRepository,
      useExisting: PhaseProjectTaskMongooseRepository,
    },
    { provide: TaskRepository, useExisting: TaskMongooseRepository },
    {
      provide: ProjectUserRepository,
      useExisting: ProjectUserMongooseRepository,
    },
    {
      provide: AuditRevisionRepository,
      useExisting: AuditRevisionMongooseRepository,
    },
    {
      provide: UserRepository,
      useExisting: UserMongooseRepository,
    },
  ],
})
export class PhasesProjectModule {}
