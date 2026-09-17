import { Injectable } from "@nestjs/common";
import { TransactionRepository } from "../../../domain/transactions/transaction.repository";
import { Transaction } from "../../../domain/transactions/transaction.entity";
import { CreateTransactionInput } from "../../../application/transactions/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly repo: TransactionRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const nextNumber = await this.seq.next("transactions");
    const id_transaction = `tr_${String(nextNumber).padStart(3, "0")}`;

    const p = new Transaction(
      id_transaction,
      input.id_project,
      input.id_user,
      input.result_transaction,
      new Date(input.transaction_date),
      input.transaction_type,
      input.id_phase_project,
      input.id_phase_project_task,
      input.comment,
    );
    return this.repo.save(p);
  }
}
