import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { CreatePhaseDto } from "../../../application/phases/dto/create-phase.dto";
import { CreatePhaseUseCase } from "../../../application/phases/use-cases/create-phase.usecase";
import { Roles } from "nest-keycloak-connect";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
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
import type { CustomRequest } from "../interceptor/request.interface";

@ApiTags("Phases")
@Controller("phases")
export class PhasesController {
  constructor(
    private readonly createPhase: CreatePhaseUseCase,
    private readonly repo: PhaseRepository,
  ) {}

  //@UseGuards(AuthGuard)
  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post()
  @ApiOperation({ summary: "Create a new phase" })
  @ApiBody({ type: CreatePhaseDto })
  @ApiResponse({
    status: 201,
    description: "Phase created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreatePhaseDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_PHASE;
    const Phase = await this.createPhase.execute(dto);
    if (!Phase) {
      throw new BadRequestException(`Phase could'nt create`);
    }
    return { Success: true, data: Phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get phase by ID" })
  @ApiParam({ name: "id", description: "Phase ID", example: "phase_001" })
  @ApiResponse({
    status: 200,
    description: "Phase found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Phase not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const phase = await this.repo.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with id '${id}' not found`);
    }
    return { Success: true, data: phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all phases with pagination" })
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
    description: "List of phases",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }
}
