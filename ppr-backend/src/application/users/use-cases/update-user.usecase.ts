import { Injectable, BadRequestException } from "@nestjs/common";
import { UserRepository } from "../../../domain/users/user.repository";
import { User } from "../../../domain/users/user.entity";
import { UpdateUserInput } from "../../../application/users/use-cases/types";

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    const exists = await this.repo.findById(id);
    if (!exists) {
      throw new BadRequestException(`User with id: "${id}" not found`);
    }

    const user = new User(
      id,
      input.id_organization,
      input.name,
      input.surname,
      input.address_street,
      input.address_number,
      input.address_state,
      input.address_country,
      input.user_email,
      input.phone_mobile,
      input.active,
      new Date(input.birthday),
      input.role,
      input.address_seed_token,
      input.wallet_address_token,
      input.did_user,
      input.keycloak_sub,
      input.apikeypok,
    );
    return this.repo.save(user);
  }
}
