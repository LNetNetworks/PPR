import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpAxiosModule } from "../http-axios.module";
import { BridgeService } from "./bridge.service";

@Module({
  imports: [ConfigModule, HttpAxiosModule],
  providers: [BridgeService],
  exports: [BridgeService],
})
export class BridgeModule {}
