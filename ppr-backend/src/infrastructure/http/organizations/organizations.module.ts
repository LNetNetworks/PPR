import { Module } from "@nestjs/common";
import { OrganizationsController } from "../controllers/organizations.controller";
import { CreateOrganizationUseCase } from "../../../application/organizations/use-cases/create-organization.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { OrganizationMongooseRepository } from "../../persistence/mongoose/repositories/organization.mongoose.repository";
import { OrganizationRepository } from "../../../domain/organizations/organization.repository";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [OrganizationsController],
  providers: [
    CreateOrganizationUseCase,
    {
      provide: OrganizationRepository,
      useExisting: OrganizationMongooseRepository,
    },
  ],
})
export class OrganizationsModule {}
