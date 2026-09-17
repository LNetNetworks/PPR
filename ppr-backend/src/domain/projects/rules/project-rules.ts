import { BadRequestException } from "@nestjs/common";
import { PhaseProject } from "../../phases/phase-project.entity";
import { PhaseType } from "../../phases/phase-type.enum";

export function ensureProjectCanChangeStatus(phases: PhaseProject[]): void {
  if (!phases || phases.length === 0) {
    throw new BadRequestException(
      "The project cannot change status because it has no phases configured",
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
      `The project cannot change status because it is missing required phase types: ${missingTypes.join(", ")}`,
    );
  }
}
