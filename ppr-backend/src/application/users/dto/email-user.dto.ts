import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EmailParamDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "The parameter must be a valid  email format." })
  @IsNotEmpty({ message: "The email parameter cannot be empty." })
  email: string;
}
