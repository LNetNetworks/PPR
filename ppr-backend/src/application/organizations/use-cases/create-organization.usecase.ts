import { Injectable } from "@nestjs/common";
import { OrganizationRepository } from "../../../domain/organizations/organization.repository";
import { Organization } from "../../../domain/organizations/organization.entity";
import { CreateOrganizationInput } from "../../../application/organizations/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly repo: OrganizationRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const nextNumber = await this.seq.next("organizations");
    const id_organization = `org_${String(nextNumber).padStart(3, "0")}`;

    const org = new Organization(
      id_organization,
      input.name_organization,
      new Date(input.date_registration),
      input.address_organization,
      input.did_organization,
    );
    return this.repo.save(org);
  }
}
