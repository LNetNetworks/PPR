import { Module } from "@nestjs/common";
import { TransactionsController } from "../controllers/transactions.controller";
import { CreateTransactionUseCase } from "../../../application/transactions/use-cases/create-transaction.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { TransactionMongooseRepository } from "../../persistence/mongoose/repositories/transaction.mongoose.repository";
import { TransactionRepository } from "../../../domain/transactions/transaction.repository";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    TransactionMongooseRepository,
    {
      provide: TransactionRepository,
      useExisting: TransactionMongooseRepository,
    },
  ],
  exports: [TransactionRepository],
})
export class TransactionsModule {}
