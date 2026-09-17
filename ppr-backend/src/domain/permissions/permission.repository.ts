import { Permission } from "./permission.entity";

export abstract class PermissionRepository {
  abstract save(permission: Permission): Promise<Permission>;
  abstract findById(id: string): Promise<Permission | null>;
  abstract findAll(params: {
    id_permission?: string;
    limit?: number;
    offset?: number;
  }): Promise<Permission[]>;
}
