import { PhaseProjectTaskStatus } from "./phase-project-task-status.enum";

export class PhaseProjectTask {
  constructor(
    public readonly id_phase_project_task: string,
    public id_phase_project: string,
    public id_task: string,
    public status_task: PhaseProjectTaskStatus = PhaseProjectTaskStatus.PENDING,
  ) {}
}
