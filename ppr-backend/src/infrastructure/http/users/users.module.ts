import { Module } from "@nestjs/common";
import { UsersController } from "../controllers/users.controller";
import { CreateUserUseCase } from "../../../application/users/use-cases/create-user.usecase";
import { UpdateUserUseCase } from "../../../application/users/use-cases/update-user.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { UserMongooseRepository } from "../../persistence/mongoose/repositories/user.mongoose.repository";
import { UserRepository } from "../../../domain/users/user.repository";
import { SyncUserUseCase } from "../../../application/users/use-cases/sync-user.usecase";
import { AuthModule } from "../../../infrastructure/auth/auth.module";
import { UserProvisioningService } from "../../../infrastructure/auth/user-provisioning.service";
import { OrganizationUserRepository } from "../../../domain/organizations/organization-user.repository";
import { OrganizationUserMongooseRepository } from "../../../infrastructure/persistence/mongoose/repositories/organization-user.mongoose.repository";

@Module({
  imports: [MongoosePersistenceModule, AuthModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    SyncUserUseCase,
    UserProvisioningService,
    { provide: UserRepository, useExisting: UserMongooseRepository },
    {
      provide: OrganizationUserRepository,
      useExisting: OrganizationUserMongooseRepository,
    },
  ],
})
export class UsersModule {}
