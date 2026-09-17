import { PermissionRole } from "./permission-role.entity";

export abstract class PermissionRoleRepository {
  abstract save(permissionRole: PermissionRole): Promise<PermissionRole>;
  abstract findById(id: string): Promise<PermissionRole | null>;
  abstract findAll(params: {
    idPermissionRole?: string;
    limit?: number;
    offset?: number;
  }): Promise<PermissionRole[]>;
}
