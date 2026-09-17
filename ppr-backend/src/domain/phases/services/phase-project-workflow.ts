import { PhaseProject } from "../phase-project.entity";
import { PhaseProjectTask } from "../phase-project-task.entity";
import { PhaseProjectStatus } from "../phase-project-status.enum";
import { PhaseProjectTaskStatus } from "../phase-project-task-status.enum";
import {
  areAllTasksClosed,
  canAutoCompletePhaseProject,
  arePreviousPhasesCompletedOrClosedOrCanceled,
  hasAnyTaskCanceled,
  hasCancellationReason,
} from "../rules/phase-project-workflow.rules";

export class PhaseProjectWorkflow {
  canMoveTaskToInProgress(task: PhaseProjectTask): boolean {
    return task.status_task === PhaseProjectTaskStatus.PENDING;
  }

  canMoveTaskToClosed(task: PhaseProjectTask): boolean {
    return task.status_task === PhaseProjectTaskStatus.IN_PROGRESS;
  }

  canMoveTaskToCanceled(task: PhaseProjectTask): boolean {
    return task.status_task === PhaseProjectTaskStatus.IN_PROGRESS;
  }

  canMovePhaseToInProgress(
    phase: PhaseProject,
    tasks: PhaseProjectTask[],
  ): { allowed: boolean; reason?: string } {
    if (!tasks || tasks.length === 0) {
      return {
        allowed: false,
        reason: "Phase must have at least one task",
      };
    }

    const hasTaskInProgress = tasks.some(
      (t) => t.status_task === PhaseProjectTaskStatus.IN_PROGRESS,
    );

    if (!hasTaskInProgress) {
      return {
        allowed: false,
        reason: "At least one task must be in progress",
      };
    }

    return { allowed: true };
  }

  canMovePhaseToCanceled(params: {
    currentPhase: PhaseProject;
    tasks: PhaseProjectTask[];
    manual: boolean;
    cancellationReason?: string;
  }): boolean {
    const { currentPhase, tasks, manual, cancellationReason } = params;

    if (currentPhase.status !== PhaseProjectStatus.IN_PROGRESS) {
      return false;
    }

    if (hasAnyTaskCanceled(tasks)) {
      return true;
    }

    if (manual && hasCancellationReason(cancellationReason)) {
      return true;
    }

    return false;
  }

  canMovePhaseToCompleted(params: {
    phase: PhaseProject;
    tasks: PhaseProjectTask[];
    manual: boolean;
    hasEvidenceRegistered: boolean;
    hasAuditRegisteredAndFinalized: boolean;
    hasContributionRegistered: boolean;
  }): { allowed: boolean; reason?: string } {
    const {
      phase,
      tasks,
      manual,
      hasEvidenceRegistered,
      hasAuditRegisteredAndFinalized,
      hasContributionRegistered,
    } = params;

    if (phase.status !== PhaseProjectStatus.IN_PROGRESS) {
      return {
        allowed: false,
        reason: "Phase must be in progress to be completed",
      };
    }

    if (!areAllTasksClosed(tasks)) {
      return {
        allowed: false,
        reason:
          "The phase already meets its requirements, but all tasks must be closed manually before completing the phase",
      };
    }

    if (manual) {
      return { allowed: true };
    }

    if (
      canAutoCompletePhaseProject({
        phase,
        hasEvidenceRegistered,
        hasAuditRegisteredAndFinalized,
        hasContributionRegistered,
      })
    ) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "The phase does not meet the required conditions to be completed",
    };
  }

  canMovePhaseToClosed(params: {
    phase: PhaseProject;
    tasks: PhaseProjectTask[];
    previousPhases: PhaseProject[];
  }): boolean {
    const { phase, tasks, previousPhases } = params;

    if (phase.status !== PhaseProjectStatus.COMPLETED) {
      return false;
    }

    if (!areAllTasksClosed(tasks)) {
      return false;
    }

    return arePreviousPhasesCompletedOrClosedOrCanceled(phase, previousPhases);
  }
}
