import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress } from "class-validator";

export class GrantRoleDto {
  @ApiProperty({
    example: "0xTokenAddress...",
    description: "Deployed token contract address",
  })
  @IsEthereumAddress()
  contractAddress: string;

  @ApiProperty({
    example: "0xAccount...",
    description: "Account address to grant role",
  })
  @IsEthereumAddress()
  account: string;
}
