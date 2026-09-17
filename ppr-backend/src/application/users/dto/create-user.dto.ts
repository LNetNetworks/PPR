import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";
import { UserRole } from "../../../domain/users/user-role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Organization Id",
    example: "org_001",
  })
  @IsString()
  @IsNotEmpty()
  id_organization: string;
  @ApiProperty({
    description: "User Name",
    example: "Juan Esteban",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: "User Surname",
    example: "Perez",
  })
  @IsString()
  @IsNotEmpty()
  surname: string;
  @ApiProperty({
    description: "User´s Street Address",
    example: "Av Cervantes",
  })
  @IsString()
  @IsNotEmpty()
  address_street: string;
  @ApiProperty({
    description: "User's Number Address",
    example: "784",
  })
  @IsString()
  @IsNotEmpty()
  address_number: string;
  @ApiProperty({
    description: "User's State or Province Address",
    example: "784",
  })
  @IsString()
  @IsNotEmpty()
  address_state: string;
  @ApiProperty({
    description: "User's Country Address",
    example: "Peru",
  })
  @IsString()
  @IsNotEmpty()
  address_country: string;
  @ApiProperty({
    description: "User's email",
    example: "jeperez@gmail.com",
  })
  @IsString()
  @IsNotEmpty()
  user_email: string;
  @ApiProperty({
    description: "User's phone mobile",
    example: "5194567673437",
  })
  @IsString()
  @IsNotEmpty()
  phone_mobile: string;
  @ApiProperty({
    description: "Status User, True is active",
    example: "True/False",
  })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
  @ApiProperty({
    description: "User's date of birth ",
    example: "2000-10-10",
  })
  @IsDateString()
  birthday: string;
  @ApiProperty({
    description: "User's role",
    example: "verifier",
    enum: ["verifier", "user", "sponsor", "provider", "superadmin"],
  })
  @IsEnum(UserRole)
  role: UserRole;
  @ApiProperty({
    description: "User's personal hash",
    example: "verifier",
  })
  @IsOptional()
  @IsString()
  address_seed_token?: string;
  @ApiProperty({
    description: "Seed Address",
    example: "word word word",
  })
  @IsOptional()
  @IsString()
  wallet_address_token?: string;
  @ApiProperty({
    description: "Index Address Wallet",
    example: "0x010a0092cb40b3cc8c4e2cdf9cf80e0805b9ef7c",
  })
  @IsOptional()
  @IsString()
  did_user?: string;
  @ApiProperty({
    description: "User's keycloack sub",
    example: "189aeae7-b84f-4d23-97ac-4eebf22124f4",
  })
  @IsOptional()
  @IsString()
  keycloak_sub?: string;
  @ApiProperty({
    description: "User's Pok apikey ",
    example: "4eebf22124f4",
  })
  @IsOptional()
  @IsString()
  apikeypok?: string;
}
