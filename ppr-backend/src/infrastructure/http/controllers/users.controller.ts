import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { CreateUserDto } from "../../../application/users/dto/create-user.dto";
import { UpdateUserDto } from "../../../application/users/dto/update.user.dto";
import { CreateUserUseCase } from "../../../application/users/use-cases/create-user.usecase";
import { UpdateUserUseCase } from "../../../application/users/use-cases/update-user.usecase";
import { AuthenticatedUser, AuthGuard, Roles } from "nest-keycloak-connect";
import { UserRepository } from "../../../domain/users/user.repository";
import { SyncUserUseCase } from "../../../application/users/use-cases/sync-user.usecase";
import { KeycloakSyncGuard } from "../../../infrastructure/auth/keycloak-sync.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import {
  SuccessResponseDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from "../dto/common-response.dto";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import type { CustomRequest } from "../interceptor/request.interface";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly repo: UserRepository,
    private readonly sync: SyncUserUseCase,
  ) {}

  //@UseGuards(AuthGuard)
  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateUserDto, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.ADD_USER;

    const user = await this.createUser.execute(dto);
    if (!user) {
      throw new BadRequestException(`User could'nt create`);
    }
    return { Success: true, data: user };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID", example: "usr_001" })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }
    return { Success: true, data: user };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get()
  @ApiOperation({ summary: "List all users with pagination and filters" })
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
  @ApiQuery({
    name: "user_id",
    required: false,
    type: String,
    description: "Filter by user ID",
    example: "usr_001",
  })
  @ApiQuery({
    name: "org_id",
    required: false,
    type: String,
    description: "Filter by organization ID",
    example: "org_001",
  })
  @ApiResponse({
    status: 200,
    description: "List of users",
    type: PaginatedResponseDto,
  })
  async list(
    @Query("limit") limit: 50,
    @Query("offset") offset = 0,
    @Query("user_id") userId?: string,
    @Query("org_id") orgId?: string,
  ) {
    const data = await this.repo.findAll({
      userId: userId,
      limit: +limit,
      offset: +offset,
    });
    return {
      Success: true,
      data,
      filters: { limit: +limit, offset: +offset, userId: userId, orgId: orgId },
    };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Put(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiParam({ name: "id", description: "User ID", example: "usr_001" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.ADD_USER_PROJECT;
    const updated = await this.updateUser.execute(id, dto as any);
    if (!updated) {
      throw new BadRequestException(`User couldn't update`);
    }
    return { Success: true, data: updated };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post("sync")
  @UseGuards(AuthGuard, KeycloakSyncGuard)
  @ApiOperation({ summary: "Sync user with Keycloak" })
  @ApiBearerAuth("keycloak")
  @ApiResponse({
    status: 200,
    description: "User synced successfully",
    schema: {
      type: "object",
      properties: {
        ok: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            id_user: { type: "string", example: "usr_001" },
            name: { type: "string", example: "John" },
            surname: { type: "string", example: "Doe" },
            user_email: { type: "string", example: "john.doe@example.com" },
            active: { type: "boolean", example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: ErrorResponseDto,
  })
  async syncUser(@AuthenticatedUser() user: any, @Req() req: CustomRequest) {
    req.transactionType = TransactionTypes.REGISTER_ACCESS_USER;
    const synced = await this.sync.execute({
      sub: user?.sub,
      email: user?.email,
      preferred_username: user?.preferred_username,
      given_name: user?.given_name,
      family_name: user?.family_name,
      role: user?.resource_access[user.azp].roles[0],
    });
    return {
      ok: true,
      data: {
        id_user: synced.id_user,
        name: synced.name,
        surname: synced.surname,
        user_email: synced.user_email,
        active: synced.active,
        rol: synced.role,
      },
    };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get(":userId/projects")
  @ApiOperation({ summary: "List projects by user ID" })
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
    description: "List of projects for the user",
    type: SuccessResponseDto,
  })
  async listByUser(
    @Param("userId") userId: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const data = await this.repo.findAll({ limit, offset, userId });
    return { Success: true, data, filters: { limit, offset, userId } };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get("/by-email/:email")
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({
    name: "email",
    description: "User email",
    example: "user@example.com",
  })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    type: ErrorResponseDto,
  })
  async findByEmail(@Param("email") email: string) {
    const user = await this.repo.findByEmail(email);
    if (!user || user.length == 0) {
      throw new NotFoundException(`User with id '${email}' not found`);
    }
    return { Success: true, data: user };
  }

  @Roles({ roles: ["sponsor", "provider", "verifier", "user"] })
  @Get("/by-role/:role")
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({ name: "userRole", description: "User role", example: "verifier" })
  @ApiResponse({
    status: 200,
    description: "User with role indicated found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "User with role indicated not found",
    type: ErrorResponseDto,
  })
  async findByRole(@Param("userRole") userRole: string) {
    const user = await this.repo.findByRole(userRole);
    if (!user) {
      throw new NotFoundException(`User with '${userRole}' not found`);
    }
    return { Success: true, data: user };
  }
}
