import { ApiProperty } from "@nestjs/swagger";
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  Matches,
} from "class-validator";

export class MintTokenDto {
  @ApiProperty({
    example: "0xTokenAddress...",
    description: "Deployed token contract address",
  })
  @IsEthereumAddress()
  contractAddress: string;

  @ApiProperty({ example: "0xReceiver...", description: "Receiver address" })
  @IsEthereumAddress()
  to: string;

  @ApiProperty({
    example: "150000",
    description: "Token amount as integer string (will be bigint)",
  })
  @IsString()
  @Matches(/^\d+$/)
  amount: string;

  @ApiProperty({
    example: "contribution:ctr_001",
    description: "Unique uid for idempotency/audit (string or 0x.. bytes32)",
  })
  @IsString()
  @IsNotEmpty()
  uid: string;

  @ApiProperty({
    example: "contribution:prj_001:pp_010",
    description: "Context string (string or 0x.. bytes32)",
  })
  @IsString()
  @IsNotEmpty()
  context: string;
}
