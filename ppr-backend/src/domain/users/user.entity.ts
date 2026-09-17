import { UserRole } from "./user-role.enum";
export class User {
  constructor(
    public readonly id_user: string,
    public id_organization: string,
    public name: string,
    public surname: string,
    public address_street: string,
    public address_number: string,
    public address_state: string,
    public address_country: string,
    public user_email: string,
    public phone_mobile: string,
    public active: boolean,
    public birthday: Date,
    public role: UserRole = UserRole.USER,
    public address_seed_token?: string,
    public wallet_address_token?: string,
    public did_user?: string,
    public keycloak_sub?: string,
    public apikeypok?: string,
  ) {}
}
