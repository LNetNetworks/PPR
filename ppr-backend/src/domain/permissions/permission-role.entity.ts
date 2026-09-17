import { UserRole } from "../users/user-role.enum";
export class PermissionRole {
  constructor(
    public readonly id_permission_role: string,
    public id_permission: string,
    public role: UserRole,
  ) {}
}
