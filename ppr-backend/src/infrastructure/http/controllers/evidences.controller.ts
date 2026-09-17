import {
  Body,
  Controller,
  Post,
  UploadedFile,
  Get,
  UseInterceptors,
  Param,
  Query,
  NotFoundException,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";
import type { Express } from "express";
import { CreateEvidenceUseCase } from "../../../application/evidences/use-cases/create-evidence.usecase";
import { CreateEvidenceDto } from "../../../application/evidences/dto/create-evidence.dto";
import { EvidenceRepository } from "../../../domain/evidences/evidence.repository";
import { Roles } from "nest-keycloak-connect";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import {
  SuccessResponseDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from "../dto/common-response.dto";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";
import type { CustomRequest } from "../interceptor/request.interface";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")

    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

@ApiTags("Evidences")
@Controller("evidences")
export class EvidencesController {
  constructor(
    private readonly createEvidence: CreateEvidenceUseCase,
    private readonly repo: EvidenceRepository,
    private readonly repoPhaseProject: PhaseProjectRepository,
  ) {}

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Post()
  @ApiOperation({ summary: "Upload evidence file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Evidence file to upload",
        },
        id_project: {
          type: "string",
          description: "Project ID",
          example: "prj_001",
        },
        id_user: {
          type: "string",
          description: "User ID",
          example: "usr_001",
        },
        id_phase_project: {
          type: "string",
          description: "Phase Project ID",
          example: "pp_001",
        },
      },
      required: ["file", "id_project", "id_user", "id_phase_project"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @ApiResponse({
    status: 201,
    description: "Evidence uploaded successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorResponseDto,
  })
  async uploadEvidence(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateEvidenceDto & { path?: string },
    @Req() req: CustomRequest,
  ) {
    req.transactionType = TransactionTypes.ADD_EVIDENCE;
    const { id_project, id_user, id_phase_project } = body;
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    const phase = await this.repoPhaseProject.findById(id_phase_project);
    if (!phase) {
      throw new BadRequestException(
        `PhaseProject with id '${id_phase_project}' not found`,
      );
    }
    const pid = id_project ? slug(String(id_project)) : "no-project";
    const phaseId = phase.id_phase;
    const own = slug(base);
    const finalName = `${pid}-${phaseId}-${own}${ext}`;

    const oldPath = file.path;
    const newPath = path.join("uploads", finalName);
    fs.renameSync(oldPath, newPath);

    const result = await this.createEvidence.execute({
      id_project,
      id_user,
      file: {
        ...file,
        filename: finalName,
        path: newPath,
      } as Express.Multer.File,
      destinationPath: id_project,
      id_phase_project,
    });

    if (!result || !result.evidence) {
      throw new BadRequestException("Evidence couldn't create");
    }

    return {
      Success: true,
      data: {
        evidence: {
          id_evidence: result.evidence.id_evidence,
          id_project: result.evidence.id_project,
          id_user: result.evidence.id_user,
          file_name: result.evidence.file_name,
          uri: result.evidence.uri,
          tx_hash: result.evidence.tx_hash ?? null,
          created_at: result.evidence.created_at ?? null,
          id_phase_project: result.evidence.id_phase_project ?? null,
        },
        phaseCompletion: result.phaseCompletion,
      },
    };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get(":id")
  @ApiOperation({ summary: "Get evidence by ID" })
  @ApiParam({ name: "id", description: "Evidence ID", example: "evid_001" })
  @ApiResponse({
    status: 200,
    description: "Evidence found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Evidence not found",
    type: ErrorResponseDto,
  })
  async byId(@Param("id") id: string) {
    const evidence = await this.repo.findById(id);
    if (!evidence) {
      throw new NotFoundException(`Evidence with id '${id}' not found`);
    }
    return { Success: true, data: evidence };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get("project/:idProject")
  @ApiOperation({ summary: "Get all evidences by project ID" })
  @ApiParam({
    name: "idProject",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiResponse({
    status: 200,
    description: "Evidences found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Evidences not found",
    type: ErrorResponseDto,
  })
  async byProject(@Param("idProject") idProject: string) {
    const data = await this.repo.findByProject(idProject);
    if (!data) {
      throw new NotFoundException(
        `Evidences with idProject '${idProject}' not found`,
      );
    }
    return { Success: true, data };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get()
  @ApiOperation({ summary: "List all evidences with pagination" })
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
    description: "List of evidences",
    type: PaginatedResponseDto,
  })
  async list(@Query("limit") limit = 50, @Query("offset") offset = 0) {
    const data = await this.repo.findAll({ limit, offset });
    return { Success: true, data, filters: { limit, offset } };
  }

  @Roles({ roles: ["verifier", "sponsor", "user", "provider"] })
  @Get("project/:idProject/user/:idUser")
  @ApiOperation({ summary: "Get all evidences by project ID and by User" })
  @ApiParam({
    name: "idProject",
    description: "Project ID",
    example: "prj_001",
  })
  @ApiParam({ name: "idUser", description: "User ID", example: "usr_001" })
  @ApiResponse({
    status: 200,
    description: "Evidences found",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Evidences not found",
    type: ErrorResponseDto,
  })
  async byProjectAndUser(
    @Param("idProject") idProject: string,
    @Param("idUser") idUser: string,
  ) {
    const data = await this.repo.findByProjectAndUser(idProject, idUser);
    if (!data) {
      throw new NotFoundException(
        `Evidences with idProject '${idProject}' not found`,
      );
    }
    return { Success: true, data };
  }
}
