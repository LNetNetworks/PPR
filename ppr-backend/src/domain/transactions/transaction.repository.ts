import { Transaction } from "./transaction.entity";
import { TransactionTypes } from "../../domain/transactions/transaction-types.enum";

export abstract class TransactionRepository {
  abstract save(Transaction: Transaction): Promise<Transaction>;
  abstract findById(id: string): Promise<Transaction | null>;
  abstract findAll(params: {
    projectId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
  abstract delete(id: string): Promise<void>;
  abstract findByProject(params: {
    projectId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
  abstract findByProjectAndType(params: {
    projectId?: string;
    typeTransaction?: TransactionTypes;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
}
