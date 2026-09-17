import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditRevision as AuditRevisionDoc } from "../schemas/audit-revision.schema";
import { AuditRevisionRepository } from "../../../../domain/audit-revisions/audit-revision.repository";
import { AuditRevision as AuditRevisionEntity } from "../../../../domain/audit-revisions/audit-revision.entity";

@Injectable()
export class AuditRevisionMongooseRepository extends AuditRevisionRepository {
  constructor(
    @InjectModel(AuditRevisionDoc.name)
    private readonly model: Model<AuditRevisionDoc>,
  ) {
    super();
  }

  async save(entity: AuditRevisionEntity): Promise<AuditRevisionEntity> {
    await this.model.updateOne({ id_revision: entity.id_revision }, entity, {
      upsert: true,
    });
    return entity;
  }

  async findById(id: string): Promise<AuditRevisionEntity | null> {
    const doc = await this.model.findOne({ id_revision: id }).lean();
    return doc
      ? new AuditRevisionEntity(
          doc.id_revision,
          doc.objetive,
          doc.id_user,
          doc.id_project,
          doc.observation,
          doc.date_revision,
          doc.id_phase_project,
          doc.status as any,
        )
      : null;
  }

  async findAll(params: {
    IdCont?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditRevisionEntity[]> {
    const q: any = {};
    if (params.IdCont) q.id_revision = params.IdCont;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new AuditRevisionEntity(
          doc.id_revision,
          doc.objetive,
          doc.id_user,
          doc.id_project,
          doc.observation,
          doc.date_revision,
          doc.id_phase_project,
          doc.status as any,
        ),
    );
  }
  async delete(id: string) {
    await this.model.deleteOne({ id_revision: id });
  }
  async existsByPhaseProjectId(id_phase_project: string): Promise<boolean> {
    const exists = await this.model.exists({ id_phase_project });
    return !!exists;
  }
  async findByPhaseProject(id_phase_project): Promise<AuditRevisionEntity[]> {
    const docs = await this.model
      .find({ id_phase_project: id_phase_project })
      .lean();
    return docs.map(
      (doc) =>
        new AuditRevisionEntity(
          doc.id_revision,
          doc.objetive,
          doc.id_user,
          doc.id_project,
          doc.observation,
          doc.date_revision,
          doc.id_phase_project,
          doc.status as any,
        ),
    );
  }
}
