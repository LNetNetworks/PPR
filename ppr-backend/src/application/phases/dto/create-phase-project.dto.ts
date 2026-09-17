import {
  IsEnum,
  IsBoolean,
  IsString,
  IsNumber,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { PhaseType } from "../../../domain/phases/phase-type.enum";

export class CreatePhaseProjectDto {
  @ApiProperty({
    description: "Phase ID associated with a project",
    example: "pha_007",
  })
  @IsString()
  id_phase: string;

  @ApiProperty({
    description: "True if evidence must be supplied.",
    example: "True/False",
  })
  @IsBoolean()
  require_evidence: boolean;
  @ApiProperty({
    description: "Phase status within the project",
    example: "prj_001",
  })
  @IsEnum(PhaseProjectStatus)
  status: PhaseProjectStatus;

  @ApiProperty({
    description: "Indicates the order of the stage within the project",
    example: "2",
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description:
      "Indicates the stage_weight as a percentage of the entire project scope.",
    example: "2",
  })
  @IsNumber()
  stage_weight: number;

  @ApiProperty({
    description: "Required monetary amount or contribution for this stage",
    example: "70000",
  })
  @IsNumber()
  contribution_required: number;
  @ApiProperty({
    description: "Received monetary amount or contribution for this stage. ",
    example: "60000",
  })
  @IsNumber()
  contribution_received: number;
  @ApiProperty({
    description: "Start Date of Phase",
    example: "2026-06-16",
  })
  @IsDateString()
  date_start: string;
  @ApiProperty({
    description: "End Date of Phase",
    example: "2026-08-16",
  })
  @IsDateString()
  date_end: string;

  @ApiProperty({
    description: "Phase type",
    example: "definition",
    enum: ["definition", "operational", "clossing"],
  })
  @IsEnum(PhaseType)
  type: PhaseType;
  @ApiProperty({
    description: "True if stage required auditory to complete",
    example: "True/False",
  })
  @IsBoolean()
  require_auditory: boolean;
  @ApiProperty({
    description: "True if stage required contribution to complete",
    example: "True/False",
  })
  @IsBoolean()
  require_contribution: boolean;
  @ApiProperty({
    description: "True if must be stage close after aproved verification",
    example: "True/False",
  })
  @IsBoolean()
  close_auditory: boolean;
  @ApiProperty({
    description: "True if must be stage close after receive contribution",
    example: "True/False",
  })
  @IsBoolean()
  close_contribution: boolean;
  @ApiProperty({
    description: "True if must be stage close after register evidence",
    example: "True/False",
  })
  @IsBoolean()
  close_evidence: boolean;
  @ApiProperty({
    description: "True if must be stage close after aproved verification",
    example: "Registracion of reason to cancel of stage",
  })
  @IsString()
  description: string;
}
