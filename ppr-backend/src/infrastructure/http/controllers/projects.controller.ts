import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Put,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateProjectDto } from "../../../application/projects/dto/create-project.dto";
import { UpdateProjectDto } from "../../../application/projects/dto/update-project.dto";
import { CreateProjectUseCase } from "../../../application/projects/use-cases/create-project.usecase";
import { UpdateProjectUseCase } from "../../../application/projects/use-cases/update-project.usecase";
import { AuthenticatedUser, AuthGuard, Roles } from "nest-keycloak-connect";
import { KeycloakSyncGuard } from "../../../infrastructure/auth/keycloak-sync.guard";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { CreatePhaseProjectDto } from "../../../application/phases/dto/create-phase-project.dto";
import { UpdatePhaseProjectDto } from "../../../application/phases/dto/update-phase-project.dto";
import { UpdatePhaseProjectUseCase } from "../../../application/phases/use-cases/update-phase-project.usecase";
import { CreatePhaseProjectUseCase } from "../../../application/phases/use-cases/create-phase-project.usecase";
import { GetProjectUseCase } from "../../../application/projects/use-cases/get-project.usecase";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { CreatePhaseProjectTaskDto } from "../../../application/phases/dto/create-phase-project-task.dto";
import { UpdatePhaseProjectTaskDto } from "../../../application/phases/dto/update-phase-project-task.dto";
import { CreatePhaseProjectTaskUseCase } from "../../../application/phases/use-cases/create-phase-project-task.usecase";
import { UpdatePhaseProjectTaskUseCase } from "../../../application/phases/use-cases/update-phase-project-task.usecase";
import { PhaseProjectTaskRepository } from "../../../domain/phases/phase-project-task.repository";
import { CreateProjectUserDto } from "../../../application/projects/dto/create-project-user.dto";
import { CreateProjectUserUseCase } from "../../../application/projects/use-cases/create-project-user.usecase";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
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
import { GetVcsAndEnqueueTitlesSyncUseCase } from "../../../application/integrations/pok/use-cases/get-vc-and-enqueue-sync.usecase";
import type { CustomRequest } from "../interceptor/request.interface";

@ApiTags("Projects")
@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly updateProject: UpdateProjectUseCase,
    private readonly getProject: GetProjectUseCase,
    private readonly createPhaseProject: CreatePhaseProjectUseCase,
    private readonly updatePhaseProject: UpdatePhaseProjectUseCase,
    private readonly createPhaseProjectTask: CreatePhaseProjectTaskUseCase,
    private readonly updatePhaseProjectTask: UpdatePhaseProjectTaskUseCase,
    private readonly repo: ProjectRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
    private readonly repoPhaseProjectTask: PhaseProjectTaskRepository,
    private readonly repoProjectUser: ProjectUserRepository,
    private readonly createProjectUser: CreateProjectUserUseCase,
    private readonly repoContributions: ContributionRepository,
    private readonly evidenceVC: GetVcsAndEnqueueTitlesSyncUseCase,
  ) {}

  @Roles({ roles: ["sponsor"] })
  @Post()
  @ApiOperation({ summary: "Create a new project" })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: "Project created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateProjectDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_PROJECT;
    const user = req.user;
    if (!user) {
      throw new BadRequestException("User token not found");
    }
    const uid = user.sub;
    const project = await this.createProject.execute({ ...dto, uid });
    if (!project) {
      throw new BadRequestException(`Project could'nt create`);
    }
    return { Success: true, data: project };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiParam({ name: "id", description: "Project ID", example: "prj_001" })
  @ApiResponse({
    status: 200,
    description: "Project found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Project not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const project = await this.getProject.execute(id);
    if (!project) {
      throw new NotFoundException(`Project with id '${id}' not found`);
    }
    return { Success: true, data: project };
  }

  @Roles({ roles: ["sponsor", "verifier", "provider", "user"] })
  @Get()
  @ApiOperation({ summary: "List all projects with pagination" })
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
    type: PaginatedResponseDto,
  })
  async list(
    @Req() req: Request & { transactionType?: TransactionTypes } & any,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException("User token not found");
    }
    const uid = user.sub;
    const data = await this.repo.findAll({ uid, limit, offset });
    if (!data) {
      throw new BadRequestException(`Projects not found`);
    }
    return { Success: true, data, filters: { limit, offset } };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Put(":id")
  @ApiOperation({ summary: "Update project by ID" })
  @ApiParam({ name: "id", description: "Project ID", example: "prj_001" })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: "Project updated successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.UPDATE_PROJECT;
    const updated = await this.updateProject.execute(id, dto as any);
    if (!updated) {
      throw new BadRequestException(`Project couldn't update`);
    }
    return { Success: true, data: updated };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":projectId/phases")
  @ApiOperation({ summary: "List all phases for a project" })
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
    description: "List of phases for the project",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async listPhases(
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
    @Param("projectId") prjId: string,
  ) {
    const data = await this.repoPhaseProject.findAll({
      limit: +limit,
      offset: +offset,
      prjId: prjId,
    });
    if (!data) {
      throw new BadRequestException(`Phases not found`);
    }
    return { Success: true, data };
  }

  @Roles({ roles: ["sponsor", "provider"] })
  @Post(":projectId/phase")
  @ApiOperation({ summary: "Add a phase to a project" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiBody({ type: CreatePhaseProjectDto })
  @ApiResponse({
    status: 201,
    description: "Phase added to project successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async addPhaseToProject(
    @Param("projectId") projectId: string,
    @Body() dto: CreatePhaseProjectDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.ADD_PHASE_PROJECT;
    const phase = await this.createPhaseProject.execute(projectId, dto as any);
    if (!phase) {
      throw new BadRequestException(
        `Phase couldn't added in Project ${projectId}`,
      );
    }
    return { Success: true, data: phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Put(":projectId/phase/:phaseId")
  @ApiOperation({ summary: "Update a phase of project" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({ name: "phaseId", description: "Phase ID", example: "pha_001" })
  @ApiBody({ type: UpdatePhaseProjectDto })
  @ApiResponse({
    status: 201,
    description: "update Phase project successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async updatePhaseToProject(
    @Param("projectId") projectId: string,
    @Param("phaseId") phaseId: string,
    @Body() dto: UpdatePhaseProjectDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.UPDATE_PHASE_PROJECT;
    const phase = await this.updatePhaseProject.execute(
      projectId,
      phaseId,
      dto as any,
    );
    if (!phase) {
      throw new BadRequestException(
        `Phase couldn't update in Project ${projectId}`,
      );
    }
    return { Success: true, data: phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":projectId/phases/:phaseProjectId/tasks")
  async listTaskofPhase(
    @Param("projectId") projectId: string,
    @Param("phaseProjectId") phaseProjectId: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const data = await this.repoPhaseProjectTask.findAllTaskOfPhaseProject(
      phaseProjectId,
      projectId,
      { limit: +limit, offset: +offset },
    );
    if (!data) {
      throw new BadRequestException(`Tasks not found in Project ${projectId}`);
    }
    return {
      Success: true,
      data,
      filters: { limit: +limit, offset: +offset },
    };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post(":projectId/phases/:phaseId/tasks")
  @ApiOperation({ summary: "Add a task to a phase project" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({
    name: "phaseId",
    description: "Phase ID",
    example: "pha_001",
  })
  @ApiBody({ type: CreatePhaseProjectTaskDto })
  @ApiResponse({
    status: 201,
    description: "Task added to phase project successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async addTaskToPhaseProject(
    @Param("projectId") projectId: string,
    @Param("phaseId") phaseId: string,
    @Body() dto: CreatePhaseProjectTaskDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.ADD_PHASE_PROJECT_TASK;
    const phase = await this.createPhaseProjectTask.execute(
      projectId,
      phaseId,
      dto as any,
    );
    if (!phase) {
      throw new BadRequestException(
        `Task couldn't added in Project ${projectId}`,
      );
    }
    return { Success: true, data: phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Put(":projectId/phasesproject/:phaseProjectId/tasks/:taskId")
  @ApiOperation({ summary: "Update task of a phase project" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({
    name: "phaseProjectId",
    description: "Phase Project ID",
    example: "pp_001",
  })
  @ApiParam({ name: "taskId", description: "task ID", example: "tsk_001" })
  @ApiBody({ type: UpdatePhaseProjectTaskDto })
  @ApiResponse({
    status: 201,
    description: "Task updated of a phase project successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async updateTaskToPhaseProject(
    @Param("projectId") projectId: string,
    @Param("phaseProjectId") phaseProjectId: string,
    @Param("taskId") taskId: string,
    @Body() dto: UpdatePhaseProjectTaskDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.UPDATE_PHASE_PROJECT_TASK;
    const phase = await this.updatePhaseProjectTask.execute(
      projectId,
      phaseProjectId,
      taskId,
      dto as any,
    );
    if (!phase) {
      throw new BadRequestException(
        `Task couldn't update in Project ${projectId} Phase ${phaseProjectId}`,
      );
    }
    return { Success: true, data: phase };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post(":projectId/members")
  @ApiOperation({ summary: "Add members to a project" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiBody({ type: [CreateProjectUserDto] })
  @ApiResponse({
    status: 201,
    description: "Members added to project successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async addMembers(
    @Param("projectId") projectId: string,
    @Body() dto: CreateProjectUserDto[],
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.ADD_MEMBERS_PROJECT;
    const created = await this.createProjectUser.executeMany(
      projectId,
      dto as any,
    );
    if (!created) {
      throw new BadRequestException(`Users couldn't be added to project`);
    }
    return { Success: true, data: created };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":projectId/members")
  @ApiOperation({ summary: "List all members of a project" })
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
    description: "List of project members",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async listMembers(
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
    @Param("projectId") projectId: string,
  ) {
    const data = await this.repoProjectUser.findAll({
      limit: +limit,
      offset: +offset,
      projectId: projectId,
    });
    if (!data) {
      throw new BadRequestException(`Members not found`);
    }
    return { Success: true, data };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":projectId/contributions")
  @ApiOperation({ summary: "List all contributions for a project" })
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
    description: "List of contributions for the project",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async listContributions(
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
    @Param("projectId") projectId: string,
  ) {
    const data = await this.repoContributions.findAll({
      limit: +limit,
      offset: +offset,
      projectId: projectId,
    });
    if (!data) {
      throw new BadRequestException(`Contributions not found`);
    }
    return { Success: true, data };
  }

  @UseGuards(AuthGuard, KeycloakSyncGuard)
  @Post(":projectId/phases/:phaseId/import-evidences")
  @ApiOperation({ summary: "Importe evidences of POK" })
  @ApiParam({
    name: "projectId",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({ name: "phaseId", description: "Phase ID", example: "ph_010" })
  @UseGuards(AuthGuard, KeycloakSyncGuard)
  @ApiResponse({
    status: 201,
    description: "Job Id added successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async importEvidences(
    @AuthenticatedUser() user: any,
    @Param("projectId") projectId: string,
    @Param("phaseId") phaseId: string,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.IMPORT_EVIDENCES;
    const requestedBy = user?.sub ?? user?.email;
    const { jobId, total } = await this.evidenceVC.execute(
      requestedBy,
      projectId,
      phaseId,
    );
    return {
      Success: true,
      sync: { jobId, total, status: "PENDING" },
    };
  }
}
