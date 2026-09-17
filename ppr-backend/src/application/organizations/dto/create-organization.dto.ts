import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrganizationDto {
  @ApiProperty({
    description: "Project name",
    example: "Teacher training program 2026",
  })
  @IsString()
  @IsNotEmpty()
  name_organization: string;
  @ApiProperty({
    description: "Registratin Date",
    example: "2026-01-23",
  })
  @IsDateString()
  date_registration: string;
  @ApiProperty({
    description: "Organization address",
    example: "Av. Maipu 283 Depto A DF - Mexico",
  })
  @IsOptional()
  @IsString()
  address_organization?: string;
  @ApiProperty({
    description: "ID DID Document",
    example: "did:lac:openprotest:0x010a0092cb40b3cc8c4e2cdf9cf80e0805b9ef7c",
  })
  @IsOptional()
  @IsString()
  did_organization?: string;
}
