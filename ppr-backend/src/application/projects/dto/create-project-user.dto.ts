import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProjectUserDto {
  @ApiProperty({
    description: "Id User",
    example: "usr_001",
  })
  @IsString()
  id_user: string;
}
