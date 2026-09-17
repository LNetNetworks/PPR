import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateUserUseCase } from "./create-user.usecase";
import { UserRepository } from "../../../domain/users/user.repository";
import { UserRole } from "../../../domain/users/user-role.enum";
import { CreateUserInput } from "./types";

type EnsurePokUserInput = {
  email: string;
  fullName?: string | null;
  id_organization?: string | null;
};

@Injectable()
export class EnsurePokUserUseCase {
  constructor(
    private readonly repo: UserRepository,
    private readonly createUser: CreateUserUseCase,
  ) {}

  async execute(input: EnsurePokUserInput) {
    const existing = await this.repo.findByEmail(input.email);

    if (existing && existing.length > 0) return existing[0];

    const arrName = input.fullName?.split(" ");
    if (!arrName) {
      throw new BadRequestException(`The user name is empty o incorrect`);
    }

    const createInput = {
      id_organization: "org_0001",
      name: arrName[0],
      surname: arrName[1],
      address_street: "street-import-POK",
      address_number: "nro-import-POK",
      address_state: "state-import-POK",
      address_country: "country-import-POK",
      user_email: input.email,
      phone_mobile: "99-999-999",
      active: true,
      birthday: "1970-01-01",
      role: UserRole.USER,
      address_seed_token: "",
      wallet_address_token: "",
      did_user: "",
      keycloak_sub: undefined,
      apikeypok: "",
    } satisfies CreateUserInput;

    try {
      return await this.createUser.execute(createInput);
    } catch (e: any) {
      if (e?.code === 11000) {
        const again = await this.repo.findByEmail(input.email);
        if (again && again.length > 0) return again[0];
      }
      throw e;
    }
  }
}
