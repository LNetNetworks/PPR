import { OrganizationUser } from "./organization-user.entity";

export abstract class OrganizationUserRepository {
  abstract save(Organization: OrganizationUser): Promise<OrganizationUser>;
  abstract findById(id: string): Promise<OrganizationUser | null>;
  abstract findAll(params: {
    IdOrgUser?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrganizationUser[]>;
  abstract delete(id: string): Promise<void>;
}
