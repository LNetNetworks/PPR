import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../domain/users/user.repository";
import { SequenceService } from "../../infrastructure/persistence/mongoose/services/sequence.service";
import { OrganizationUserRepository } from "../../domain/organizations/organization-user.repository";

@Injectable()
export class UserProvisioningService {
  constructor(
    private readonly users: UserRepository,
    private readonly seq: SequenceService,
    private readonly orgUsers: OrganizationUserRepository,
  ) {}

  async ensureUserFromKeycloakPayload(payload: any) {
    const keycloakSub = payload.sub as string;
    const existing = await this.users.findByKeycloakSub?.(keycloakSub);
    if (existing) return existing;
  }
}
