import { Injectable } from "@nestjs/common";
import { OrganizationUserRepository } from "../../../domain/organizations/organization-user.repository";
import { OrganizationUser } from "../../../domain/organizations/organization-user.entity";
import { CreateOrganizationUserInput } from "../../../application/organizations/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreateOrganizationUserUseCase {
  constructor(
    private readonly repo: OrganizationUserRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreateOrganizationUserInput): Promise<OrganizationUser> {
    const nextNumber = await this.seq.next("OrganizationUsers");
    const id_OrganizationUser = `ou_${String(nextNumber).padStart(3, "0")}`;

    const org = new OrganizationUser(
      id_OrganizationUser,
      input.id_organization,
      input.id_user,
      input.role,
    );
    return this.repo.save(org);
  }
}
