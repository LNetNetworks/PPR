import { Module } from "@nestjs/common";
import { ProjectsModule } from "./projects/projects.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { EvidencesModule } from "./evidences/evidences.module";
import { HealthDocModule } from "./health-doc/health-doc.module";
import { UsersModule } from "./users/users.module";
import { ContributionsModule } from "./contributions/contributions.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { PhasesModule } from "./phases/phases.module";
import { TasksModule } from "./tasks/tasks.module";
import { AuditRevisionsModule } from "./audit-revisions/audit-revision.module";
import { SystemEnumModule } from "./system/system-enums.module";
import { PokModule } from "../integrations/pok/pok.module";
import { BridgeModule } from "../integrations/bridge/bridge.module";
import { BlockchainIntegrationModule } from "../integrations/blockchain/blockchain.module";
import { PhasesProjectModule } from "./phases-projects/phases-projects.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TransactionAuditInterceptor } from "./interceptor/transaction-audit.interceptor";
import { MongoosePersistenceModule } from "../persistence/mongoose/mongoose.module";
import { TokensModule } from "./tokens/tokens.module";

@Module({
  imports: [
    MongoosePersistenceModule,
    ProjectsModule,
    OrganizationsModule,
    EvidencesModule,
    HealthDocModule,
    UsersModule,
    ContributionsModule,
    TransactionsModule,
    PhasesModule,
    TasksModule,
    AuditRevisionsModule,
    SystemEnumModule,
    PokModule,
    BlockchainIntegrationModule,
    PhasesProjectModule,
    TokensModule,
    BridgeModule,
  ],
  providers: [
    TransactionAuditInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: TransactionAuditInterceptor,
    },
  ],
})
export class HttpApiModule {}
