import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";

export interface CreateTransactionInput {
  id_project: string;
  id_user: string;
  result_transaction: string;
  transaction_date: Date;
  transaction_type: TransactionTypes;
  id_phase_project?: string;
  id_phase_project_task?: string;
  comment: string;
}
