import { Module } from "@nestjs/common";
import { HealthDocController } from "../controllers/health-doc.controller";
import { VersionController } from "./version.controller";

@Module({
  controllers: [HealthDocController, VersionController],
  providers: [],
})
export class HealthDocModule {}
