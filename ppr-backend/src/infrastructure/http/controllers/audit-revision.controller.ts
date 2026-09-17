import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Put,
  Req,
} from "@nestjs/common";
import { CreateAuditRevisionDto } from "../../../application/audit-revisions/dto/create-audit-revision.dto";
import { CreateAuditRevisionUseCase } from "../../../application/audit-revisions/use-cases/create-audit-revision.usecase";
import { Roles } from "nest-keycloak-connect";
import { AuditRevisionRepository } from "../../../domain/audit-revisions/audit-revision.repository";
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
import { UpdateAuditRevisionDto } from "../../../application/audit-revisions/dto/update-audit-revision.dto";
import { UpdateAuditRevisionUseCase } from "../../../application/audit-revisions/use-cases/update-audit-revision.usecase";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import type { CustomRequest } from "../interceptor/request.interface";

@ApiTags("Audit Revisions")
@Controller("audit")
export class AuditRevisionsController {
  constructor(
    private readonly createAuditRevision: CreateAuditRevisionUseCase,
    private readonly repo: AuditRevisionRepository,
    private readonly updateAuditRevision: UpdateAuditRevisionUseCase,
  ) {}

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post()
  @ApiOperation({ summary: "Create a new audit revision" })
  @ApiBody({ type: CreateAuditRevisionDto })
  @ApiResponse({
    status: 201,
    description: "Audit revision created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateAuditRevisionDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_AUDIT;
    const AuditRevision = await this.createAuditRevision.execute(dto);
    return { Success: true, data: AuditRevision };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get audit revision by ID" })
  @ApiParam({
    name: "id",
    description: "Audit revision ID",
    example: "audit_001",
  })
  @ApiResponse({
    status: 200,
    description: "Audit revision found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Audit revision not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const audit = await this.repo.findById(id);
    if (!audit) {
      throw new NotFoundException(`AuditRevision with id '${id}' not found`);
    }
    return { Success: true, data: audit };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all audit revisions with pagination" })
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
    description: "List of audit revisions",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Put(":id")
  @ApiOperation({ summary: "Update an audit revision" })
  @ApiParam({
    name: "id",
    description: "Audit revision ID",
    example: "aud_001",
  })
  @ApiBody({ type: UpdateAuditRevisionDto })
  @ApiResponse({
    status: 200,
    description: "Audit revision updated successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Audit revision not found",
    type: ErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAuditRevisionDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.UPDATE_AUDIT;
    req.id_project = dto.id_project;
    const result = await this.updateAuditRevision.execute(id, dto);
    if (!result || !result.audit) {
      throw new NotFoundException(`AuditRevision with id '${id}' not found`);
    }

    return {
      Success: true,
      data: result,
    };
  }
}
