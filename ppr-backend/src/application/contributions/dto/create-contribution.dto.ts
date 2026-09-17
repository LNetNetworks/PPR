import { IsDateString, IsString, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PhaseCompletionInfoDto {
  @ApiProperty({
    description: "Indicates whether the phase was completed automatically",
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: "Informative message about phase completion",
    example:
      "The phase already meets its requirements, but all tasks must be closed manually before completing the phase",
    required: false,
  })
  message?: string;
}

export class ContributionDto {
  @ApiProperty({
    description: "Project Id",
    example: "prj_001",
  })
  @IsString()
  id_project: string;
  @ApiProperty({
    description: "User Id",
    example: "usr_001",
  })
  @IsString()
  id_user: string;
  @ApiProperty({
    description: "Amount of money contributed",
    example: "120000",
  })
  @IsNumber()
  @Min(0)
  deposit_amount: number;
  @ApiProperty({
    description: "Id Project Phase",
    example: "pp_0001",
  })
  @IsString()
  id_phase_project: string;
  @ApiProperty({
    description: "Deposit or Transfer date",
    example: "2026-01-01",
  })
  @IsDateString()
  date_contribution: Date;
}

export class CreateContributionResponseDto {
  @ApiProperty({ type: ContributionDto })
  contribution: ContributionDto;

  @ApiProperty({ type: PhaseCompletionInfoDto })
  phaseCompletion: PhaseCompletionInfoDto;
}
