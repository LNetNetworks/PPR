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
import { ContributionDto } from "../../../application/contributions/dto/create-contribution.dto";
import { CreateContributionUseCase } from "../../../application/contributions/use-cases/create-contribution.usecase";
import { Roles } from "nest-keycloak-connect";
import { ContributionRepository } from "../../../domain/contributions/contribution.repository";
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

@ApiTags("Contributions")
@Controller("contributions")
export class ContributionsController {
  constructor(
    private readonly createContribution: CreateContributionUseCase,
    private readonly repo: ContributionRepository,
  ) {}

  @Roles({ roles: ["sponsor"] })
  @Post()
  @ApiOperation({ summary: "Create a new contribution" })
  @ApiBody({ type: ContributionDto })
  @ApiResponse({
    status: 201,
    description: "Contribution created successfully",
    schema: {
      example: {
        success: true,
        data: {
          contribution: {
            id_project: "prj_001",
            id_user: "usr_001",
            deposit_amount: 120000,
            id_phase_project: "pp_0001",
            date_contribution: "2026-01-01",
          },
          phaseCompletion: {
            completed: false,
            message:
              "The phase already meets its requirements, but all tasks must be closed manually before completing the phase",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: ContributionDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_CONTRIBUTION_PHASE;

    const user = req.user as any;
    if (!user) {
      throw new BadRequestException("User token not found");
    }

    const uid = user.sub;

    const result = await this.createContribution.execute({ ...dto, uid });

    if (!result || !result.contribution) {
      throw new BadRequestException(`Contribution could'nt create`);
    }

    return {
      success: true,
      data: result,
    };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get contribution by ID" })
  @ApiParam({
    name: "id",
    description: "Contribution ID",
    example: "contrib_001",
  })
  @ApiResponse({
    status: 200,
    description: "Contribution found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Contribution not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw new NotFoundException(`Contribution with id '${id}' not found`);
    }
    return { Success: true, data: org };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all contributions with pagination" })
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
    description: "List of contributions",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }
}
