import { PartialType } from "@nestjs/swagger";
import { CreatePhaseProjectTaskDto } from "../dto/create-phase-project-task.dto";

export class UpdatePhaseProjectTaskDto extends PartialType(
  CreatePhaseProjectTaskDto,
) {}
