import { BadRequestException } from "../shared/domain-error";

export const ensureValidProjectDates = (start: Date, end?: Date) => {
  if (end && end < start)
    throw new BadRequestException("date_end must be >= date_start");
};

export const ensureApprovalPercentage = (value: number) => {
  if (value < 0 || value > 100) {
    throw new BadRequestException(
      "approval_percentage must be between 0 and 100",
    );
  }
};
