import { Module, Global } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsController } from "./metrics.controller";
import { MetricsTokenGuard } from "./metrics-token.guard";

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: "/metrics",
      controller: MetricsController,
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [MetricsTokenGuard],
})
export class MetricsModule {}
