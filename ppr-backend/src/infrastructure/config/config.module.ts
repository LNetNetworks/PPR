import { Module } from "@nestjs/common";
import { ConfigModule as NestConfig } from "@nestjs/config";
import { envSchema } from "./env.validation";
import appConfig from "./app.config";

@Module({
  imports: [
    NestConfig.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      validationSchema: envSchema,
      load: [appConfig],
    }),
  ],
})
export class ConfigModule {}
