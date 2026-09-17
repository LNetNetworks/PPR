import { TransactionTypes } from "./transaction-types.enum";
export class Transaction {
  constructor(
    public readonly id_transaction: string,
    public id_project: string,
    public id_user: string,
    public result_transaction: string,
    public transaction_date: Date,
    public transaction_type: TransactionTypes,
    public id_phase_project?: string,
    public id_phase_project_task?: string,
    public comment?: string,
  ) {}
}
