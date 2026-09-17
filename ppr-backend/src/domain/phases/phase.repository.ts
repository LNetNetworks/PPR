import { Phase } from "./phase.entity";

export abstract class PhaseRepository {
  abstract save(phase: Phase): Promise<Phase>;
  abstract findById(id: string): Promise<Phase | null>;
  abstract findAll(params: {
    idPhase?: string;
    limit?: number;
    offset?: number;
  }): Promise<Phase[]>;
}
