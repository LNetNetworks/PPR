import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Project, ProjectSchema } from "./schemas/project.schema";
import {
  Organization,
  OrganizationSchema,
} from "./schemas/organization.schema";
import { Evidence, EvidenceSchema } from "./schemas/evidence.schema";
import { User, UserSchema } from "./schemas/user.schema";
import {
  Contribution,
  ContributionSchema,
} from "./schemas/contribution.schema";
import { ProjectMongooseRepository } from "./repositories/project.mongoose.repository";
import { OrganizationMongooseRepository } from "./repositories/organization.mongoose.repository";
import { EvidenceMongooseRepository } from "./repositories/evidence.mongoose.repository";
import { UserMongooseRepository } from "./repositories/user.mongoose.repository";
import { Counter, CounterSchema } from "./schemas/counter.schema";
import { SequenceService } from "./services/sequence.service";
import { UserRepository } from "../../../domain/users/user.repository";
import { ContributionMongooseRepository } from "./repositories/contribution.mongoose.repository";
import { TransactionMongooseRepository } from "./repositories/transaction.mongoose.repository";
import { Transaction, TransactionSchema } from "./schemas/transaction.schema";
import { Phase, PhaseSchema } from "./schemas/phase.schema";
import { PhaseMongooseRepository } from "./repositories/phase.mongoose.repository";
import { Task, TaskSchema } from "./schemas/task.schema";
import { TaskMongooseRepository } from "./repositories/task.mongoose.repository";
import {
  AuditRevision,
  AuditRevisionSchema,
} from "./schemas/audit-revision.schema";
import { AuditRevisionMongooseRepository } from "./repositories/audit-revision.mongoose.repository";
import {
  OrganizationUser,
  OrganizationUserSchema,
} from "./schemas/organization-user.schema";
import { OrganizationUserMongooseRepository } from "./repositories/organization-user.mongoose.repository";
import { OrganizationUserRepository } from "../../../domain/organizations/organization-user.repository";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import {
  PhaseProject,
  PhaseProjectSchema,
} from "./schemas/phase-project.schema";
import { PhaseProjectMongooseRepository } from "./repositories/phase-project.mongoose.repository";
import { PhaseProjectTaskMongooseRepository } from "./repositories/phase-project-task.mongoose.repository";
import {
  PhaseProjectTask,
  PhaseProjectTaskSchema,
} from "./schemas/phase-project-task.schema";
import { ProjectUserMongooseRepository } from "./repositories/project-user.mongoose.repository";
import { ProjectUser, ProjectUserSchema } from "./schemas/project-user.schema";
import { SyncJob, SyncJobSchema } from "./schemas/sync-job.schema";
import { SyncTask, SyncTaskSchema } from "./schemas/sync-task.schema";
import { SyncQueueMongooseRepository } from "./repositories/sync-queue.mongoose.repository";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("db.uri"),
        dbName: config.get<string>("db.name"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema, collection: "projects" },
      {
        name: Organization.name,
        schema: OrganizationSchema,
        collection: "organizations",
      },
      { name: Evidence.name, schema: EvidenceSchema, collection: "evidences" },
      { name: User.name, schema: UserSchema, collection: "users" },
      { name: Counter.name, schema: CounterSchema, collection: "counters" },
      {
        name: Contribution.name,
        schema: ContributionSchema,
        collection: "contributions",
      },
      {
        name: Transaction.name,
        schema: TransactionSchema,
        collection: "transactions",
      },
      { name: Phase.name, schema: PhaseSchema, collection: "phases" },
      { name: Task.name, schema: TaskSchema, collection: "tasks" },
      {
        name: AuditRevision.name,
        schema: AuditRevisionSchema,
        collection: "audit-revision",
      },
      {
        name: OrganizationUser.name,
        schema: OrganizationUserSchema,
        collection: "organization-user",
      },
      {
        name: PhaseProject.name,
        schema: PhaseProjectSchema,
        collection: "phase-project",
      },
      {
        name: PhaseProjectTask.name,
        schema: PhaseProjectTaskSchema,
        collection: "phase-project-task",
      },
      {
        name: ProjectUser.name,
        schema: ProjectUserSchema,
        collection: "project-user",
      },
      { name: SyncJob.name, schema: SyncJobSchema },
      { name: SyncTask.name, schema: SyncTaskSchema },
    ]),
  ],
  providers: [
    ProjectMongooseRepository,
    OrganizationMongooseRepository,
    EvidenceMongooseRepository,
    UserMongooseRepository,
    { provide: UserRepository, useExisting: UserMongooseRepository },
    SequenceService,
    ContributionMongooseRepository,
    TransactionMongooseRepository,
    PhaseMongooseRepository,
    TaskMongooseRepository,
    AuditRevisionMongooseRepository,
    OrganizationUserMongooseRepository,
    {
      provide: OrganizationUserRepository,
      useExisting: OrganizationUserMongooseRepository,
    },
    PhaseProjectMongooseRepository,
    {
      provide: PhaseProjectRepository,
      useExisting: PhaseProjectMongooseRepository,
    },
    PhaseProjectTaskMongooseRepository,
    ProjectUserMongooseRepository,
    SyncQueueMongooseRepository,
  ],
  exports: [
    ProjectMongooseRepository,
    OrganizationMongooseRepository,
    { provide: UserRepository, useExisting: UserMongooseRepository },
    EvidenceMongooseRepository,
    UserMongooseRepository,
    {
      provide: OrganizationUserRepository,
      useExisting: OrganizationUserMongooseRepository,
    },
    ContributionMongooseRepository,
    MongooseModule,
    SequenceService,
    TransactionMongooseRepository,
    PhaseMongooseRepository,
    TaskMongooseRepository,
    PhaseProjectRepository,
    AuditRevisionMongooseRepository,
    OrganizationUserMongooseRepository,
    PhaseProjectMongooseRepository,
    PhaseProjectTaskMongooseRepository,
    ProjectUserMongooseRepository,
    SyncQueueMongooseRepository,
  ],
})
export class MongoosePersistenceModule {}
