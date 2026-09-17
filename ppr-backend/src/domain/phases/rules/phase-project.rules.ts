import { BadRequestException } from "@nestjs/common";
import { PhaseProject } from "../phase-project.entity";
import { PhaseType } from "../phase-type.enum";

export function ensureProjectHasMinimumRequiredPhases(
  phases: PhaseProject[],
): void {
  if (!phases || phases.length < 3) {
    throw new BadRequestException(
      "Before start a project must contain at least 3 phases: definition, operational and closing",
    );
  }

  const phaseTypes = new Set(phases.map((phase) => phase.type));

  const requiredTypes: PhaseType[] = [
    PhaseType.DEFINITION,
    PhaseType.OPERATIONAL,
    PhaseType.CLOSING,
  ];

  const missingTypes = requiredTypes.filter((type) => !phaseTypes.has(type));

  if (missingTypes.length > 0) {
    throw new BadRequestException(
      `Project is missing required phase types: ${missingTypes.join(", ")}`,
    );
  }
}
