import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Phase as PhaseDoc } from "../schemas/phase.schema";
import { PhaseRepository } from "../../../../domain/phases/phase.repository";
import { Phase as PhaseEntity } from "../../../../domain/phases/phase.entity";

@Injectable()
export class PhaseMongooseRepository extends PhaseRepository {
  constructor(
    @InjectModel(PhaseDoc.name) private readonly model: Model<PhaseDoc>,
  ) {
    super();
  }

  async save(entity: PhaseEntity): Promise<PhaseEntity> {
    await this.model.updateOne({ id_phase: entity.id_phase }, entity, {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    return entity;
  }

  async findById(id: string): Promise<PhaseEntity | null> {
    const doc = await this.model.findOne({ id_phase: id }).lean();
    return doc
      ? new PhaseEntity(doc.id_phase, doc.name_phase, doc.brief_description)
      : null;
  }

  async findAll(params: {
    idPhase?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PhaseEntity[]> {
    const q: any = {};
    if (params.idPhase) q.id_organization = params.idPhase;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new PhaseEntity(doc.id_phase, doc.name_phase, doc.brief_description),
    );
  }
}
