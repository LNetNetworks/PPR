import { Controller, Get } from "@nestjs/common";
import { Public } from "nest-keycloak-connect";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class HealthDocController {
  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        Success: { type: "boolean", example: true },
        status: { type: "string", example: "up" },
      },
    },
  })
  health() {
    return { Success: true, status: "up" };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "API home endpoint" })
  @ApiResponse({
    status: 200,
    description: "API information",
    schema: {
      type: "object",
      properties: {
        Success: { type: "boolean", example: true },
        msg: { type: "string", example: "PPR API -ver /ppr/docs" },
      },
    },
  })
  home() {
    return { Success: true, msg: "PPR API -ver /ppr/docs" };
  }
}
