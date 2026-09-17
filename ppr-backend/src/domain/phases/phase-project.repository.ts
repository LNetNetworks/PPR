import { PhaseProject } from "./phase-project.entity";

export abstract class PhaseProjectRepository {
  abstract save(PhaseProject: PhaseProject): Promise<PhaseProject>;
  abstract findById(id: string): Promise<PhaseProject | null>;
  abstract findAll(params: {
    limit?: number;
    offset?: number;
    prjId?: string;
  }): Promise<PhaseProject[]>;
  abstract findByPhase(params: {
    phaseId: string;
    projectId: string;
  }): Promise<PhaseProject | null>;
  abstract findByProject(projectId: string): Promise<PhaseProject[]>;
}
