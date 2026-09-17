import { UserRole } from "../../../domain/users/user-role.enum";

export interface CreatePermissionInput {
  name_permission: string;
  description_permission: string;
}

export interface CreatePermissionRoleInput {
  id_permission: string;
  role: UserRole;
}

export interface CreatePermissionUserAdittionalInput {
  id_user: string;
  id_permission: string;
  type: boolean;
}
