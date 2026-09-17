import { Injectable, BadRequestException } from "@nestjs/common";
import { PermissionUserAdittionalRepository } from "../../../domain/permissions/permission-user-adittional.repository";
import { PermissionUserAdittional } from "../../../domain/permissions/permission-user-adittional.entity";
import { CreatePermissionUserAdittionalInput } from "../../../application/permissions/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { UserRepository } from "../../../domain/users/user.repository";
import { PermissionRepository } from "../../../domain/permissions/permission.repository";

@Injectable()
export class CreatePermissionUserAdittionalUseCase {
  constructor(
    private readonly repo: PermissionUserAdittionalRepository,
    private readonly seq: SequenceService,
    private readonly repoUser: UserRepository,
    private readonly repoPermission: PermissionRepository,
  ) {}

  async execute(
    permissionId: string,
    userId: string,
    input: CreatePermissionUserAdittionalInput,
  ): Promise<PermissionUserAdittional> {
    const permission = await this.repoPermission.findById(permissionId);

    if (!permission) {
      throw new BadRequestException(
        `Permission with id: "${permissionId}" not found`,
      );
    }

    const user = await this.repoUser.findById(userId);

    if (!user) {
      throw new BadRequestException(`User with id: "${userId}" not found`);
    }

    const nextNumber = await this.seq.next("permission_user_adittional");
    const id_permission_repository = `pua_${String(nextNumber).padStart(3, "0")}`;
    const permission_user_adittional = new PermissionUserAdittional(
      id_permission_repository,
      userId,
      input.id_permission,
      input.type,
    );

    return this.repo.save(permission_user_adittional);
  }
}
