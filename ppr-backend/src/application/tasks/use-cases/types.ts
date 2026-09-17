export interface CreateTaskInput {
  name_task: string;
}

export interface CreatePhaseProjectTaskInput {
  id_phase_project: string;
  id_task: string;
  status: string;
}
