import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

@Injectable()
export class MetricsTokenGuard implements CanActivate {
  private readonly expectedToken: string;

  constructor(private readonly configService: ConfigService) {
    this.expectedToken = this.configService.getOrThrow<string>("metrics.token");
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers["authorization"] ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token !== this.expectedToken) {
      throw new UnauthorizedException("Invalid or missing metrics token");
    }
    return true;
  }
}
