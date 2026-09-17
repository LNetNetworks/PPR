import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Public } from "nest-keycloak-connect";
import type { Response } from "express";
import { MetricsTokenGuard } from "./metrics-token.guard";

@Controller("metrics")
export class MetricsController extends PrometheusController {
  @Public()
  @UseGuards(MetricsTokenGuard)
  @Get()
  async index(@Res({ passthrough: true }) response: Response): Promise<string> {
    return super.index(response);
  }
}
