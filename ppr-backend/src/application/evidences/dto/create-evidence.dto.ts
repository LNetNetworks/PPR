import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PhaseCompletionInfoDto {
  @ApiProperty()
  completed: boolean;

  @ApiProperty({ required: false })
  message?: string;
}

export class CreateEvidenceDto {
  @ApiProperty()
  @IsString()
  id_project!: string;

  @ApiProperty()
  @IsString()
  id_user!: string;

  @ApiProperty()
  @IsString()
  id_phase_project: string;
}

export class EvidenceDto {
  @ApiProperty()
  id_evidence: string;

  @ApiProperty()
  id_project: string;

  @ApiProperty()
  id_user: string;

  @ApiProperty()
  file_name: string;

  @ApiProperty()
  uri: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  tx_hash: string;

  @ApiProperty()
  id_phase_project: string;
}

export class CreateEvidenceResponseDto {
  @ApiProperty({ type: EvidenceDto })
  evidence: EvidenceDto;

  @ApiProperty({ type: PhaseCompletionInfoDto })
  phaseCompletion: PhaseCompletionInfoDto;
}
