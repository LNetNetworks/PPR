export class Contribution {
  constructor(
    public readonly id_contribution: string,
    public id_project: string,
    public id_user: string,
    public deposit_amount: number,
    public id_phase_project: string,
    public date_contribution: Date,
  ) {}
}
