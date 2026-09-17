import { PhaseProjectStatus } from "../../../domain/phases/phase-project-status.enum";
import { PhaseProjectTaskStatus } from "../../../domain/phases/phase-project-task-status.enum";
import { PhaseType } from "../../../domain/phases/phase-type.enum";
export interface CreatePhaseInput {
  name_phase: string;
  brief_description: string;
}

export interface CreatePhaseProjectInput {
  id_phase: string;
  require_evidence: boolean;
  status: PhaseProjectStatus;
  order: number;
  stage_weight: number;
  contribution_required: number;
  contribution_received: number;
  date_start: string;
  date_end: string;
  type: PhaseType;
  require_auditory: boolean;
  require_contribution: boolean;
  close_auditory: boolean;
  close_contribution: boolean;
  close_evidence: boolean;
  description: string;
}

export interface UpdatePhaseProjectInput {
  id_phase: string;
  require_evidence: boolean;
  status: PhaseProjectStatus;
  order: number;
  stage_weight: number;
  contribution_required: number;
  contribution_received: number;
  date_start: string;
  date_end: string;
  type: PhaseType;
  require_auditory: boolean;
  require_contribution: boolean;
  close_auditory: boolean;
  close_contribution: boolean;
  close_evidence: boolean;
  description: string;
}

export interface CreatePhaseProjectTaskInput {
  id_task: string;
  status_task: PhaseProjectTaskStatus;
}

export interface UpdatePhaseProjectTaskInput {
  id_task: string;
  status_task: PhaseProjectTaskStatus;
}
