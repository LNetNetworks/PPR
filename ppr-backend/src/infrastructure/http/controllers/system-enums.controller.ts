import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { SystemEnumsUseCase } from "../../../application/system/system-enums.use-case";
import { Roles } from "nest-keycloak-connect";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("System Enums")
@Controller("enums")
export class SystemEnumController {
  constructor(private readonly getAllEnums: SystemEnumsUseCase) {}

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "Get all system enums" })
  @ApiResponse({
    status: 200,
    description: "List of all system enums",
  })
  getAll() {
    return this.getAllEnums.execute();
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":name")
  @ApiOperation({ summary: "Get a specific enum by name" })
  @ApiParam({
    name: "name",
    description: "Enum name",
    example: "ProjectStatus",
  })
  @ApiResponse({
    status: 200,
    description: "Enum values",
  })
  @ApiResponse({
    status: 404,
    description: "Enum not found",
  })
  getOne(@Param("name") name: string) {
    const data = this.getAllEnums.getOne(name);
    if (!data) throw new NotFoundException(`Enum "${name}" no encontrado`);
    return data;
  }
}
