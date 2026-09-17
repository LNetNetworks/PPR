import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "nest-keycloak-connect";

@ApiTags("System")
@Controller("version")
export class VersionController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Get application version" })
  @ApiResponse({
    status: 200,
    description: "Version information",
    schema: {
      properties: {
        version: { type: "string" },
        commit: { type: "string" },
        timestamp: { type: "string" },
      },
    },
  })
  getVersion() {
    const commit = process.env.CI_COMMIT_SHORT_SHA || "unknown";
    const version =
      process.env.CI_COMMIT_TAG || process.env.CI_COMMIT_SHORT_SHA || "0.0.1";

    return {
      version,
      commit,
      timestamp: new Date().toISOString(),
    };
  }
}
