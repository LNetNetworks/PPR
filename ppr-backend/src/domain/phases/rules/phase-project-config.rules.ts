import { BadRequestException } from "@nestjs/common";
import { PhaseProject } from "../phase-project.entity";

export function ensureValidPhaseAutoCloseConfiguration(
  phase: PhaseProject,
): void {
  if (phase.close_evidence && !phase.require_evidence) {
    throw new BadRequestException(
      "Invalid phase configuration: close_evidence cannot be true when require_evidence is false",
    );
  }

  if (phase.close_auditory && !phase.require_auditory) {
    throw new BadRequestException(
      "Invalid phase configuration: close_auditory cannot be true when require_auditory is false",
    );
  }

  if (phase.close_contribution && !phase.require_contribution) {
    throw new BadRequestException(
      "Invalid phase configuration: close_contribution cannot be true when require_contribution is false",
    );
  }
}
