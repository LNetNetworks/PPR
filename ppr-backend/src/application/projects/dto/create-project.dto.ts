import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from "class-validator";
import { ProjectStatus } from "../../../domain/projects/project-status.enum";
import { ProjectTypes } from "../../../domain/projects/project-types.enum";
import { ApiProperty } from "@nestjs/swagger";
import { ProjectPaises } from "../../../domain/projects/project-paises.enum";
import { AssetTokenSymbol } from "../../../domain/projects/project-asset-token.enum";
import { TypeCurrency } from "../../../domain/projects/project-type-currency.enum";

export class CreateProjectDto {
  @ApiProperty({
    description: "Proyect type",
    example: "education",
    enum: [
      "education",
      "tecnology",
      "social",
      "infrastructure",
      "energy",
      "agriculture",
    ],
  })
  @IsEnum(ProjectTypes)
  type_project: ProjectTypes;
  @ApiProperty({
    description: "Start Date of Project",
    example: "2026-06-16",
  })
  @IsDateString()
  date_start: string;
  @ApiProperty({
    description: "Name of Project",
    example: "",
  })
  @IsString()
  @IsNotEmpty()
  name_project: string;
  @ApiProperty({
    description: "Organization ID",
    example: "org_001",
  })
  @IsString()
  id_organization: string;
  @ApiProperty({
    description: "Country associated with Project",
    example: "Peru",
    enum: ["Peru", "Argentina", "Jamaica", "Honduras"],
  })
  @IsString()
  @IsEnum(ProjectPaises)
  country_region: ProjectPaises;
  @ApiProperty({
    description: "Status Project",
    example: "inprogress",
    enum: ["pending", "inprogress", "closed", "canceled"],
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
  @ApiProperty({
    description: "End Date Project",
    example: "2026-01-12",
  })
  @IsDateString()
  date_end: string;
  @ApiProperty({
    description: "Breve description of project",
    example:
      "The main goal is to promote social inclusion and ensure that participants can confidently access vital online services.",
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({
    description: "Total Amount Contributed",
    example: "100000",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_contributed_amount?: number;
  @IsOptional() @IsString() wallet_provider?: string;
  @IsOptional()
  @ApiProperty({
    description: "Asset Token Symbol (Blockchain)",
    example: AssetTokenSymbol.USDC,
    enum: AssetTokenSymbol,
  })
  @IsEnum(AssetTokenSymbol)
  asset_token: AssetTokenSymbol;
  @IsOptional()
  @ApiProperty({
    description: "Type Currency (Fiat)",
    example: TypeCurrency.USD,
    enum: TypeCurrency,
  })
  @IsEnum(TypeCurrency)
  type_currency: TypeCurrency;
}
