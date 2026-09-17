import { IsDateString, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { TransactionTypes } from "../../../domain/transactions/transaction-types.enum";

export class CreateTransactionDto {
  @ApiProperty({
    description: "Project Id associated with the transaction",
    example: "prj-001",
  })
  @IsString()
  id_project: string;
  @ApiProperty({
    description: "User Id who initiated the transaction",
    example: "usr-001",
  })
  @IsString()
  id_user: string;
  @ApiProperty({
    description: "PhaseProjectTask Id associated with the transaction",
    example: "pt-001",
  })
  @IsString()
  result_transaction: string;
  @ApiProperty({
    description: "Date of transaction",
    example: "2026-01-02",
  })
  @IsDateString()
  transaction_date: Date;
  @ApiProperty({
    description: "Type transaction",
    example: "add_contribution_phase",
    enum: [
      "add_contribution_phase",
      "create_project",
      "update_project",
      "update_user",
    ],
  })
  @IsDateString()
  transaction_type: TransactionTypes;
  @ApiProperty({
    description: "Id Phase Project receive contribution",
    example: "pp-001",
  })
  @IsString()
  id_phase_project?: string;
  @ApiProperty({
    description: "Id Phase ProjectTask receive contribution",
    example: "ppt-001",
  })
  @IsString()
  id_phase_project_task?: string;
  @ApiProperty({
    description: "Comment associated with the transaction",
    example: "",
  })
  @IsString()
  comment: string;
}
