import { Request } from "express";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";

export interface CustomRequest extends Request {
  transactionType?: TransactionTypes;
  id_project?: string;
  id_phase?: string;
  id_phase_task?: string;
  comment?: string;
  user?: any;
  currentUser?: {
    id_user: string;
    role: string;
    email: string;
  };
}
