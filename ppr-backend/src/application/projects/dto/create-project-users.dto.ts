import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, ArrayNotEmpty, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { CreateProjectUserDto } from "./create-project-user.dto";

export class CreateProjectUsersDto {
  @ApiProperty({ type: [CreateProjectUserDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectUserDto)
  users: CreateProjectUserDto[];
}
