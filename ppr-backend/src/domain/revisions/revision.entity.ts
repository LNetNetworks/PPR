export class Revision {
  constructor(
    public readonly id_revision: string,
    public id_user: string,
    public id_project: string,
    public observation: string,
    public date_revision: Date,
    public id_phase_project: string,
    public status: string,
  ) {}
}
