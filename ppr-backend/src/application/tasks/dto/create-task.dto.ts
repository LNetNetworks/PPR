import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    description: "Name Task",
    example: "Upload Evidence",
  })
  @IsString()
  @IsNotEmpty()
  name_task: string;
}
