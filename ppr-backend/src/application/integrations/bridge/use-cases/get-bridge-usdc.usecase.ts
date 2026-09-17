import { Injectable } from "@nestjs/common";
import { BridgeService } from "../../../../infrastructure/integrations/bridge/bridge.service";

@Injectable()
export class GetBridgeUsdcUseCase {
  constructor(private readonly bridge: BridgeService) {}

  async deposit(to: string, amount: number | string) {
    return this.bridge.deposit({ to, amount });
  }

  async retiro(to: string, amount: number | string) {
    return this.bridge.retiro({ to, amount });
  }
}
