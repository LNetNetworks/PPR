import { Injectable } from "@nestjs/common";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
import { Phase } from "../../../domain/phases/phase.entity";
import { CreatePhaseInput } from "../../../application/phases/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";

@Injectable()
export class CreatePhaseUseCase {
  constructor(
    private readonly repo: PhaseRepository,
    private readonly seq: SequenceService,
  ) {}

  async execute(input: CreatePhaseInput): Promise<Phase> {
    const nextNumber = await this.seq.next("Phases");
    const id_phase = `pha_${String(nextNumber).padStart(3, "0")}`;

    const org = new Phase(id_phase, input.name_phase, input.brief_description);
    return this.repo.save(org);
  }
}
