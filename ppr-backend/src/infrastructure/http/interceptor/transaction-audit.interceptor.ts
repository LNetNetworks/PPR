import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { SequenceService } from "../../persistence/mongoose/services/sequence.service";
import { TransactionRepository } from "../../../domain/transactions/transaction.repository";
import { Transaction } from "../../../domain/transactions/transaction.entity";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import { Request } from "express";

interface TrackedRequest extends Request {
  transactionType?: TransactionTypes;
  currentUser?: { id_user?: string } | any;
  id_project?: { id_project?: string } | any;
  id_phase_project?: { id_phase_project?: string } | any;
  id_phase_project_task?: { id_phase_project_task?: string } | any;
  comment?: { comment?: string } | any;
}

@Injectable()
export class TransactionAuditInterceptor implements NestInterceptor {
  constructor(
    private readonly seq: SequenceService,
    private readonly txRepo: TransactionRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<TrackedRequest>();

    return next.handle().pipe(
      tap((responseBody) => {
        void (async () => {
          try {
            const txType = req.transactionType;
            if (!txType) return;

            const currentUser = req.currentUser;
            const id_user = currentUser?.id_user as string | undefined;

            const body = req.body || {};
            const params = (req.params as Record<string, any>) || {};

            const id_project = (req.id_project ||
              body.id_project ||
              params.projectId ||
              params.id_project) as string | undefined;
            const id_phase_project = (req.id_phase_project ||
              body.id_phase_project ||
              params.id_phase_project) as string | undefined;
            const id_phase_project_task = (req.id_phase_project_task ||
              body.id_phase_project_task ||
              params.id_phase_project_task) as string | undefined;
            const comment = (req.comment ||
              body.comment ||
              body.description) as string | undefined;

            const now = new Date();
            const payload =
              responseBody && typeof responseBody === "object"
                ? (responseBody.data ?? responseBody)
                : responseBody;

            const result_transaction = JSON.stringify(payload ?? null);

            const nextNumber = await this.seq.next("transactions");
            const id_transaction = `tx_${String(nextNumber).padStart(4, "0")}`;

            const tx = new Transaction(
              id_transaction,
              id_project ?? "n/a",
              id_user ?? "unknown",
              result_transaction,
              now,
              txType,
              id_phase_project,
              id_phase_project_task,
              comment,
            );

            await this.txRepo.save(tx);
          } catch (error) {
            console.error(
              `Error saving transaction log: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        })();
      }),
    );
  }
}
