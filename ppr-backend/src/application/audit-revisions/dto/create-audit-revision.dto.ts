import { IsDateString, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";

export class CreateAuditRevisionDto {
  @ApiProperty({
    description: "Brief description of the audit objetive",
    example:
      "to issue an independent opinion on the results of operations and its cash flows",
  })
  @IsString()
  objetive: string;
  @ApiProperty({
    description: "User Id performing the audit ",
    example: "usr_002",
  })
  @IsString()
  id_user: string;
  @ApiProperty({
    description: "Project Id being audited",
    example: "prj_003",
  })
  @IsString()
  id_project: string;
  @ApiProperty({
    description:
      "Audit Findings, Opportunities for Improvement,Recommendation etc.",
    example:
      'Policy states that certain sensitive files can only be accessed by Team A.It is found that user "Juan Pérez" (unauthorized) accessed a critical file',
  })
  @IsString()
  observation: string;
  @ApiProperty({
    description: "Id Phase project",
    example: "pp_013",
  })
  @IsString()
  id_phase_project: string;
  @ApiProperty({
    description: "Revision Date",
    example: "2026-07-10",
  })
  @IsDateString()
  date_revision: Date;
  @ApiProperty({
    description: "Status Audit",
    example: "planned",
    enum: [
      "planned",
      "in_coordination",
      "in_progress",
      "evaluation",
      "revision",
      "finalized",
      "follow_up",
    ],
  })
  @IsEnum(AuditStatus)
  status: AuditStatus;
}
