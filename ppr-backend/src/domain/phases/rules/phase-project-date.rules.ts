import { BadRequestException } from "@nestjs/common";
import { Project } from "../../projects/project.entity";

export function ensurePhaseDatesAreValidForProject(
  project: Project,
  newPhaseStart: Date,
  newPhaseEnd: Date,
): void {
  if (newPhaseStart > newPhaseEnd) {
    throw new BadRequestException(
      "The phase start date cannot be later than the end date",
    );
  }

  if (newPhaseStart < project.date_start || newPhaseEnd > project.date_end) {
    throw new BadRequestException(
      "The phase dates must be within the project date range",
    );
  }
}
