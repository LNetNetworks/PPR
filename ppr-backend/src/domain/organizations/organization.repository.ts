import { Organization } from "./organization.entity";

export abstract class OrganizationRepository {
  abstract save(Organization: Organization): Promise<Organization>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findAll(params: {
    limit?: number;
    offset?: number;
    orgId?: string;
    userId?: string;
  }): Promise<Organization[]>;
  abstract delete(id: string): Promise<void>;
}
