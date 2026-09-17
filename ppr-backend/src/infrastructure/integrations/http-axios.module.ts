import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ExternalApiClient } from "./external-api.client";

@Module({
  imports: [HttpModule],
  providers: [ExternalApiClient],
  exports: [ExternalApiClient, HttpModule],
})
export class HttpAxiosModule {}
