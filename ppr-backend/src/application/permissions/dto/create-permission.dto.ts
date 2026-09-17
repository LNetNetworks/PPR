import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePermissionDto {
  @ApiProperty({
    description: "Permission name",
    example: "List of evidences",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Description of the permission",
    example: "Access to the list of evidence",
  })
  @IsString()
  description: string;
}
