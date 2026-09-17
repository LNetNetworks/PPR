import { PartialType } from "@nestjs/swagger";
import { CreatePhaseProjectDto } from "../dto/create-phase-project.dto";

export class UpdatePhaseProjectDto extends PartialType(CreatePhaseProjectDto) {}
