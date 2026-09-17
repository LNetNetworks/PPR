import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../../domain/users/user-role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrganizationUserDto {
  @ApiProperty({
    description: "Id User",
    example: "usr_001",
  })
  @IsString()
  id_user: string;
  @ApiProperty({
    description: "User role",
    example: "verifier",
    enum: ["verifier", "user", "sponsor", "provider", "superadmin"],
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
