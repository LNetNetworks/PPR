import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { CreateOrganizationDto } from "../../../application/organizations/dto/create-organization.dto";
import { CreateOrganizationUseCase } from "../../../application/organizations/use-cases/create-organization.usecase";
import { OrganizationRepository } from "../../../domain/organizations/organization.repository";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import {
  SuccessResponseDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from "../dto/common-response.dto";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import { Roles } from "nest-keycloak-connect";
import type { CustomRequest } from "../interceptor/request.interface";

@ApiTags("Organizations")
@Controller("organizations")
export class OrganizationsController {
  constructor(
    private readonly createOrganization: CreateOrganizationUseCase,
    private readonly repo: OrganizationRepository,
  ) {}

  //@UseGuards(AuthGuard)
  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({
    status: 201,
    description: "Organization created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateOrganizationDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_ORGANIZATION;
    const organization = await this.createOrganization.execute(dto);
    if (!organization) {
      throw new BadRequestException(`Organization could'nt create`);
    }
    return { Success: true, data: organization };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiParam({ name: "id", description: "Organization ID", example: "org_001" })
  @ApiResponse({
    status: 200,
    description: "Organization found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Organization not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with id '${id}' not found`);
    }
    return { Success: true, data: org };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all organizations with pagination" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 50,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of items to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "List of organizations",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":orgId/projects")
  @ApiOperation({ summary: "List projects by organization ID" })
  @ApiParam({
    name: "orgId",
    description: "Organization ID",
    example: "org_001",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 50,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of items to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "List of projects",
    type: SuccessResponseDto,
  })
  async listByOrganization(
    @Param("orgId") orgId: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const data = await this.repo.findAll({ limit, offset, orgId: orgId });
    return { Success: true, data, filters: { limit, offset, orgId: orgId } };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":orgId/users/:userId/projects")
  @ApiOperation({ summary: "List projects by organization ID and user ID" })
  @ApiParam({
    name: "orgId",
    description: "Organization ID",
    example: "org_001",
  })
  @ApiParam({ name: "userId", description: "User ID", example: "usr_001" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 50,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of items to skip",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "List of projects",
    type: SuccessResponseDto,
  })
  async listByOrganizationAndUser(
    @Param("orgId") orgId: string,
    @Param("userId") userId: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const data = await this.repo.findAll({ limit, offset, orgId, userId });
    return {
      Success: true,
      data,
      filters: { limit, offset, organizationId: orgId, userId },
    };
  }
}
