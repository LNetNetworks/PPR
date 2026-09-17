import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GcpUploadClient } from "./gcp-upload.client";

@Module({
  imports: [ConfigModule],
  providers: [GcpUploadClient],
  exports: [GcpUploadClient],
})
export class StorageModule {}
