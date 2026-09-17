import { Injectable, BadRequestException } from "@nestjs/common";
import { PermissionRole } from "../../../domain/permissions/permission-role.entity";
import { CreatePermissionRoleInput } from "../../../application/permissions/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { PermissionRoleRepository } from "../../../domain/permissions/permission-role.repository";
import { PermissionRepository } from "../../../domain/permissions/permission.repository";

@Injectable()
export class CreatePermisionRoleUseCase {
  constructor(
    private readonly repo: PermissionRoleRepository,
    private readonly seq: SequenceService,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async execute(
    permissionId: string,
    input: CreatePermissionRoleInput,
  ): Promise<PermissionRole> {
    const per = await this.permissionRepo.findById(permissionId);
    if (!per) {
      throw new BadRequestException(
        `Permission with id: "${permissionId}" not found`,
      );
    }

    const nextNumber = await this.seq.next("PermissionRole");
    const id_permission_role = `prl_${String(nextNumber).padStart(3, "0")}`;

    const permissionRole = new PermissionRole(
      id_permission_role,
      input.id_permission,
      input.role,
    );
    return this.repo.save(permissionRole);
  }
}
