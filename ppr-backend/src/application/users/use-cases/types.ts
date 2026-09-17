import { UserRole } from "../../../domain/users/user-role.enum";

export interface CreateUserInput {
  id_organization: string;
  name: string;
  surname: string;
  address_street: string;
  address_number: string;
  address_state: string;
  address_country: string;
  user_email: string;
  phone_mobile: string;
  active: boolean;
  birthday: string;
  role: UserRole;
  address_seed_token?: string;
  wallet_address_token?: string;
  did_user?: string;
  keycloak_sub?: string;
  apikeypok?: string;
}

export interface UpdateUserInput {
  id_organization: string;
  name: string;
  surname: string;
  address_street: string;
  address_number: string;
  address_state: string;
  address_country: string;
  user_email: string;
  phone_mobile: string;
  active: boolean;
  birthday: string;
  role: UserRole;
  address_seed_token?: string;
  wallet_address_token?: string;
  did_user?: string;
  keycloak_sub?: string;
  apikeypok?: string;
}
