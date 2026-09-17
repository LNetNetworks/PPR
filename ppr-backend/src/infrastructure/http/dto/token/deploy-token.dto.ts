import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeployTokenDto {
  @ApiProperty({ example: "Token Seguro", description: "Token name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "TKN", description: "Token symbol" })
  @IsString()
  @IsNotEmpty()
  symbol: string;
}
