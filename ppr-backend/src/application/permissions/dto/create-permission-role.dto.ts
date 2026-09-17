import { IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../../domain/users/user-role.enum";

export class CreatePermissionRoleDto {
  @ApiProperty({
    description: "Permission ID",
    example: "per_007",
  })
  @IsString()
  id_permission: string;

  @ApiProperty({
    description: "User's role",
    example: "verifier",
    enum: ["verifier", "user", "sponsor", "provider", "superadmin"],
  })
  @IsEnum(UserRole)
  role: UserRole;
}
