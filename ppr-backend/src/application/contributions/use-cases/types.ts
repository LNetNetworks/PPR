export interface CreateContributionInput {
  id_project: string;
  id_user: string;
  deposit_amount: number;
  id_phase_project: string;
  date_contribution: Date;
  uid?: string;
}
