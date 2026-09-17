import { UserRole } from "../users/user-role.enum";

export class OrganizationUser {
  constructor(
    public readonly id_organization_user: string,
    public id_organization: string,
    public id_user: string,
    public role: UserRole = UserRole.USER,
  ) {}
}
