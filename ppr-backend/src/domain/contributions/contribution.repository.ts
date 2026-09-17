import { Contribution } from "./contribution.entity";

export abstract class ContributionRepository {
  abstract save(Contribution: Contribution): Promise<Contribution>;
  abstract findById(id: string): Promise<Contribution | null>;
  abstract findAll(params: {
    limit?: number;
    offset?: number;
    projectId?: string;
  }): Promise<Contribution[]>;
  abstract delete(id: string): Promise<void>;
  abstract existsByPhaseProjectId(id_phase_project: string): Promise<boolean>;
  abstract findByPhaseProjectId(
    phaseProjectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Contribution[]>;
}
