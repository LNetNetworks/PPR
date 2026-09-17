import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../../../domain/users/user.repository";
import { OrganizationUserRepository } from "../../../domain/organizations/organization-user.repository";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { User } from "../../../domain/users/user.entity";
import { OrganizationUser } from "../../../domain/organizations/organization-user.entity";
import { UserRole } from "../../../domain/users/user-role.enum";

type KeycloakToken = {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  role?: string;
};

@Injectable()
export class SyncUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly seq: SequenceService,
    private readonly orgUsers: OrganizationUserRepository,
  ) {}

  async execute(token: KeycloakToken): Promise<User> {
    if (!token.role) {
      throw new NotFoundException(`The role of User is empty`);
    }

    const foundBySub = await this.users.findByKeycloakSub(token.sub);
    if (foundBySub) return foundBySub;

    if (token.email) {
      const foundByEmail = await this.users.findByEmail(token.email);
      if (foundByEmail && foundByEmail.length > 0) {
        const updated =
          (await (this.users as any).upsertFromKeycloak?.({
            id_user: foundByEmail[0].id_user,
            keycloak_sub: token.sub,
            email: token.email,
            name: token.given_name ?? foundByEmail[0].name,
            surname: token.family_name ?? foundByEmail[0].surname,
            active: true,
            role: token.role ?? foundByEmail[0].role,
          })) ?? foundByEmail;
        return updated;
      }
    }

    const DEFAULT_ORG_ID = "org_001";
    const id_organization = DEFAULT_ORG_ID;
    const name = token.given_name ?? "";
    const surname = token.family_name ?? "";
    const address_street = "";
    const address_number = "";
    const address_state = "";
    const address_country = "";
    const user_email = token.email ?? "";
    const phone_mobile = "000-00000000";
    const active = true;
    const birthday = new Date("1980-02-09");
    const role = token.role as UserRole;
    const address_seed_token = "";
    const wallet_address_token = "";
    const did_user = "";
    const keycloak_sub = token.sub;
    const apikeypok = "";

    const next = await this.seq.next("users");
    const id_user = `usr_${String(next).padStart(3, "0")}`;
    const entity = new User(
      id_user,
      id_organization,
      name,
      surname,
      address_street,
      address_number,
      address_state,
      address_country,
      user_email,
      phone_mobile,
      active,
      birthday,
      role,
      address_seed_token,
      wallet_address_token,
      did_user,
      keycloak_sub,
      apikeypok,
    );
    const id_organization_user = "org_001";

    const orgUserEntity = new OrganizationUser(
      id_organization_user,
      DEFAULT_ORG_ID,
      id_user,
      role,
    );

    await this.orgUsers.save(orgUserEntity);
    const created = await (this.users as any).upsertFromKeycloak?.({
      id_user,
      keycloak_sub: token.sub,
      email: token.email,
      name: entity.name,
      surname: entity.surname,
      active: true,
      role: entity.role,
    });

    return created ?? (await this.users.save(entity));
  }
}
