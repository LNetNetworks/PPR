import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { CreateTransactionUseCase } from "../../../application/transactions/use-cases/create-transaction.usecase";
import { Roles } from "nest-keycloak-connect";
import { TransactionRepository } from "../../../domain/transactions/transaction.repository";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import {
  SuccessResponseDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from "../dto/common-response.dto";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";

@ApiTags("Transactions")
@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly repo: TransactionRepository,
  ) {}

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get(":id")
  @ApiOperation({ summary: "Get transaction by ID" })
  @ApiParam({ name: "id", description: "Transaction ID", example: "txn_001" })
  @ApiResponse({
    status: 200,
    description: "Transaction found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const trs = await this.repo.findById(id);
    if (!trs) {
      throw new NotFoundException(`Transaction with id '${id}' not found`);
    }
    return { Success: true, data: trs };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get()
  @ApiOperation({ summary: "List all transactions with pagination" })
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
    description: "List of transactions",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get("project/:projectId")
  @ApiOperation({ summary: "List all transactions by Project with pagination" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
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
    description: "List of transactions",
    type: PaginatedResponseDto,
  })
  async listByProject(
    @Param("projectId") projectId: string,
    @Query("limit") limit: 50,
    @Query("offset") offset = 0,
  ) {
    const data = await this.repo.findByProject({
      projectId: projectId,
      limit: +limit,
      offset: +offset,
    });
    return {
      Success: true,
      data,
      filters: { projectId: projectId, limit: +limit, offset: +offset },
    };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get("project/:projectId/type/:typeTransaction")
  @ApiOperation({
    summary:
      "List all transactions by Project and TypeTransaction with pagination",
  })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({
    name: "typeTransaction",
    description: "Transaction Type",
    example: "add_evidence_project",
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
    description: "List of transactions",
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async listByProjectByType(
    @Param("projectId") projectId: string,
    @Param("typeTransaction") typeTransaction: TransactionTypes,
    @Query("limit") limit: 50,
    @Query("offset") offset = 0,
  ) {
    const numericLimit = Number(limit);
    const numericOffset = Number(offset);

    if (Number.isNaN(numericLimit) || Number.isNaN(numericOffset)) {
      throw new BadRequestException("limit and offset must be numbers");
    }
    const data = await this.repo.findByProjectAndType({
      projectId,
      typeTransaction,
      limit: numericLimit,
      offset: numericOffset,
    });
    return {
      Success: true,
      data,
      filters: { projectId, typeTransaction, limit: +limit, offset: +offset },
    };
  }
}
