import { PermissionUserAdittional } from "./permission-user-adittional.entity";

export abstract class PermissionUserAdittionalRepository {
  abstract save(
    permissionUserAdittional: PermissionUserAdittional,
  ): Promise<PermissionUserAdittional>;
  abstract findById(id: string): Promise<PermissionUserAdittional | null>;
  abstract findAll(params: {
    idPermissionUserAdittional?: string;
    limit?: number;
    offset?: number;
  }): Promise<PermissionUserAdittional[]>;
}
