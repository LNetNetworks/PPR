import { BadRequestException } from "@nestjs/common";
import { PhaseProject } from "../phase-project.entity";
import { PhaseProjectTask } from "../phase-project-task.entity";
import { PhaseProjectStatus } from "../phase-project-status.enum";
import { PhaseProjectTaskStatus } from "../phase-project-task-status.enum";

export function ensurePhaseProjectIsInProgress(phase: PhaseProject): void {
  if (phase.status !== PhaseProjectStatus.IN_PROGRESS) {
    throw new BadRequestException(
      "Evidence can only be uploaded when the phase project is IN_PROGRESS",
    );
  }
}

export function ensurePhaseProjectIsInProgressOrCompletedForEvidence(
  phase: PhaseProject,
): void {
  if (
    phase.status !== PhaseProjectStatus.IN_PROGRESS &&
    phase.status !== PhaseProjectStatus.COMPLETED
  ) {
    throw new BadRequestException(
      "Evidence can only be uploaded when the phase project is IN_PROGRESS or COMPLETED",
    );
  }
}

export function ensurePhaseProjectIsInProgressOrCompletedForAudit(
  phase: PhaseProject,
): void {
  if (
    phase.status !== PhaseProjectStatus.IN_PROGRESS &&
    phase.status !== PhaseProjectStatus.COMPLETED
  ) {
    throw new BadRequestException(
      "Audit can only be created or updated when the phase project is IN_PROGRESS or COMPLETED",
    );
  }
}

export function ensureAuditCanBeFinalizedOnlyWhenPhaseCompleted(
  phase: PhaseProject,
  auditStatus?: string,
): void {
  if (
    auditStatus === "finalized" &&
    phase.status !== PhaseProjectStatus.COMPLETED
  ) {
    throw new BadRequestException(
      "Audit can only be finalized when the phase project is COMPLETED",
    );
  }
}

export function ensurePhaseProjectHasAtLeastOneTask(
  tasks: PhaseProjectTask[],
): void {
  if (!tasks || tasks.length === 0) {
    throw new BadRequestException(
      "A phase project must contain at least one task",
    );
  }
}

export function hasAnyTaskInProgress(tasks: PhaseProjectTask[]): boolean {
  return tasks.some(
    (task) => task.status_task === PhaseProjectTaskStatus.IN_PROGRESS,
  );
}

export function hasAnyTaskCanceled(tasks: PhaseProjectTask[]): boolean {
  return tasks.some(
    (task) => task.status_task === PhaseProjectTaskStatus.CANCELED,
  );
}

export function areAllTasksClosed(tasks: PhaseProjectTask[]): boolean {
  return (
    tasks.length > 0 &&
    tasks.every((task) => task.status_task === PhaseProjectTaskStatus.CLOSED)
  );
}

export function hasCancellationReason(description?: string): boolean {
  return !!description?.trim();
}

export function arePreviousPhasesCompletedOrClosedOrCanceled(
  currentPhase: PhaseProject,
  phases: PhaseProject[],
): boolean {
  const previousPhases = phases.filter(
    (phase) => phase.order < currentPhase.order,
  );

  return previousPhases.every(
    (phase) =>
      phase.status === PhaseProjectStatus.COMPLETED ||
      phase.status === PhaseProjectStatus.CLOSED ||
      phase.status === PhaseProjectStatus.CANCELED,
  );
}

export function canAutoCompletePhaseProject(params: {
  phase: PhaseProject;
  hasEvidenceRegistered: boolean;
  hasAuditRegisteredAndFinalized: boolean;
  hasContributionRegistered: boolean;
}): boolean {
  const {
    phase,
    hasEvidenceRegistered,
    hasAuditRegisteredAndFinalized,
    hasContributionRegistered,
  } = params;

  const activeConditions = [
    phase.require_evidence && phase.close_evidence
      ? hasEvidenceRegistered
      : null,
    phase.require_auditory && phase.close_auditory
      ? hasAuditRegisteredAndFinalized
      : null,
    phase.require_contribution && phase.close_contribution
      ? hasContributionRegistered
      : null,
  ].filter((condition): condition is boolean => condition !== null);

  return activeConditions.length > 0 && activeConditions.every(Boolean);
}
