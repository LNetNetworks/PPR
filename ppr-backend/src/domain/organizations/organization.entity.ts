export class Organization {
  constructor(
    public readonly id_organizations: string,
    public name_organization: string,
    public date_registration: Date,
    public address_organization?: string,
    public did_organizations?: string,
  ) {}
}
