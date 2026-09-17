import { Injectable } from "@nestjs/common";
import { QueueTaskProcessor } from "../processors/queue-task.processor";
import { PokTitlesSyncProcessor } from "../processors/pok-titles-sync.processor";
import { ProjectBridgeDepositProcessor } from "../processors/project-bridge-deposit.processor";
import { ProjectBridgeWithdrawProcessor } from "../processors/project-bridge-withdraw.processor";

@Injectable()
export class QueueProcessorsRegistry {
  constructor(
    private readonly pokTitles: PokTitlesSyncProcessor,
    private readonly projectBridgeDeposit: ProjectBridgeDepositProcessor,
    private readonly projectBridgeWithdraw: ProjectBridgeWithdrawProcessor,
  ) {}

  getAll(): QueueTaskProcessor[] {
    return [this.pokTitles, this.projectBridgeDeposit, this.projectBridgeWithdraw];
  }
}
