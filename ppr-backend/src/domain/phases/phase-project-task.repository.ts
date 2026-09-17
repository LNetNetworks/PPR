import { PhaseProjectTask } from "./phase-project-task.entity";

export abstract class PhaseProjectTaskRepository {
  abstract save(phase: PhaseProjectTask): Promise<PhaseProjectTask>;
  abstract findById(id: string): Promise<PhaseProjectTask | null>;
  abstract findAll(params: {
    idPhase?: string;
    limit?: number;
    offset?: number;
  }): Promise<PhaseProjectTask[]>;
  abstract findByPhaseProjectTask(
    idPhaseProject: string,
    idTask: string,
  ): Promise<PhaseProjectTask | null>;
  abstract findByPhaseProjectId(
    phaseProjectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<PhaseProjectTask[]>;
  abstract findAllTaskOfPhaseProject(
    phaseProjectId: string,
    projectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<any[]>;
}
