import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "../../../domain/permissions/permission.repository";
import { Permission } from "../../../domain/permissions/permission.entity";
import { CreatePermissionInput } from "../../../application/permissions/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    private readonly repo: PermissionRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreatePermissionInput): Promise<Permission> {
    const nextNumber = await this.seq.next("Permissions");
    const id_permission = `per_${String(nextNumber).padStart(3, "0")}`;

    const per = new Permission(
      id_permission,
      input.name_permission,
      input.description_permission,
    );
    return this.repo.save(per);
  }
}
