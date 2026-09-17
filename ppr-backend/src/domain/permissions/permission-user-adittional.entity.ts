export class PermissionUserAdittional {
  constructor(
    public readonly id_permission_user_adittional: string,
    public id_user: string,
    public id_permission: string,
    public type: boolean,
  ) {}
}
