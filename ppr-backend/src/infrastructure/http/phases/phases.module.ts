import { Module } from "@nestjs/common";
import { PhasesController } from "../controllers/phases.controller";
import { CreatePhaseUseCase } from "../../../application/phases/use-cases/create-phase.usecase";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";
import { PhaseMongooseRepository } from "../../persistence/mongoose/repositories/phase.mongoose.repository";
import { PhaseRepository } from "../../../domain/phases/phase.repository";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [PhasesController],
  providers: [
    CreatePhaseUseCase,
    { provide: PhaseRepository, useExisting: PhaseMongooseRepository },
  ],
})
export class PhasesModule {}
