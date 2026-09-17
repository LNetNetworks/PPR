import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../domain/users/user.repository";
import { User } from "../../../domain/users/user.entity";
import { CreateUserInput } from "../../../application/users/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly repo: UserRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const nextNumber = await this.seq.next("users");
    const id_user = `usr_${String(nextNumber).padStart(3, "0")}`;

    const user = new User(
      id_user,
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
