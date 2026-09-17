import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Req,
  Param,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { CreateTaskDto } from "../../../application/tasks/dto/create-task.dto";
import { CreateTaskUseCase } from "../../../application/tasks/use-cases/create-task.usecase";
import { Roles } from "nest-keycloak-connect";
import { TaskRepository } from "../../../domain/tasks/task.repository";
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

@ApiTags("Tasks")
@Controller("tasks")
export class TasksController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly repo: TaskRepository,
  ) {}

  //@UseGuards(AuthGuard)
  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: "Task created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateTaskDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_TASK;
    const task = await this.createTask.execute(dto);
    if (!task) {
      throw new BadRequestException(`Task could'nt create`);
    }
    return { Success: true, data: task };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  @ApiParam({ name: "id", description: "Task ID", example: "task_001" })
  @ApiResponse({
    status: 200,
    description: "Task found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Task not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const task = await this.repo.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with id '${id}' not found`);
    }
    return { Success: true, data: task };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all tasks with pagination" })
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
    description: "List of tasks",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit: 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit: +limit, offset: +offset });
    return { Success: true, data, filters: { limit: +limit, offset: +offset } };
  }
}
