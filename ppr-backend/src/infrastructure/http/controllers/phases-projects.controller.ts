import { Controller } from "@nestjs/common";

import { CreatePhaseProjectTaskUseCase } from "../../../application/phases/use-cases/create-phase-project-task.usecase";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Phase Projects")
@Controller("phases-projects")
export class PhasesProjectController {
  constructor(
    private readonly createPhaseProjectTask: CreatePhaseProjectTaskUseCase,
  ) {}
}
