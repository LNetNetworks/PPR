import { UserRole } from "../../../domain/users/user-role.enum";

export interface CreateOrganizationInput {
  name_organization: string;
  date_registration: string;
  address_organization?: string;
  did_organization?: string;
}

export interface CreateOrganizationUserInput {
  id_organization: string;
  id_user: string;
  role: UserRole;
}
