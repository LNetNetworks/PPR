import { PhaseProjectStatus } from "./phase-project-status.enum";
import { PhaseType } from "./phase-type.enum";

export class PhaseProject {
  constructor(
    public readonly id_phase_project: string,
    public id_phase: string,
    public id_project: string,
    public require_evidence: boolean,
    public status: PhaseProjectStatus = PhaseProjectStatus.PENDING,
    public order: number,
    public stage_weight: number,
    public contribution_required: number,
    public contribution_received: number,
    public date_start: Date,
    public date_end: Date,
    public type: PhaseType,
    public require_auditory: boolean,
    public require_contribution: boolean,
    public close_auditory: boolean,
    public close_contribution: boolean,
    public close_evidence: boolean,
    public description: string,
  ) {}
}
