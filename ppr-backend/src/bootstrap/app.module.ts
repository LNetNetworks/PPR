import { Module } from "@nestjs/common";
import { ConfigModule } from "../infrastructure/config/config.module";
import { HttpApiModule } from "../infrastructure/http/http.module";
import { MongoosePersistenceModule } from "../infrastructure/persistence/mongoose/mongoose.module";
import { AuthModule } from "../infrastructure/auth/auth.module";
import { HttpAxiosModule } from "../infrastructure/integrations/http-axios.module";
import { ScheduleModule } from "@nestjs/schedule";
import { WorkersModule } from "../infrastructure/workers/workers.module";
import { MetricsModule } from "../infrastructure/metrics/metrics.module";

@Module({
  imports: [
    ConfigModule,
    MongoosePersistenceModule,
    AuthModule,
    HttpAxiosModule,
    HttpApiModule,
    ScheduleModule,
    WorkersModule,
    MetricsModule,
  ],
})
export class AppModule {}
