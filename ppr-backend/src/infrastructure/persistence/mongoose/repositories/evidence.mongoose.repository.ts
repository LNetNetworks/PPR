import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Evidence as EvidenceEntity } from "../../../../domain/evidences/evidence.entity";
import { EvidenceRepository } from "../../../../domain/evidences/evidence.repository";
import { Evidence as EvidenceDoc } from "../schemas/evidence.schema";
import { EvidenceStatus } from "../../../../domain/evidences/evidence-status.enum";
import { User as UserDoc } from "../schemas/user.schema";
import { Project as ProjectDoc } from "../schemas/project.schema";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";

@Injectable()
export class EvidenceMongooseRepository extends EvidenceRepository {
  constructor(
    @InjectModel(EvidenceDoc.name) private readonly model: Model<EvidenceDoc>,
    @InjectModel(ProjectDoc.name)
    private readonly projectModel: Model<ProjectDoc>,
    @InjectModel(UserDoc.name) private readonly userModel: Model<UserDoc>,
    @InjectModel(PhaseProjectDoc.name)
    private readonly phaseProjectModel: Model<EvidenceDoc>,
  ) {
    super();
  }

  async save(entity: EvidenceEntity): Promise<EvidenceEntity> {
    const userDoc = await this.userModel
      .findOne({ id_user: entity.id_user })
      .exec();
    const projectDoc = await this.projectModel
      .findOne({ id_project: entity.id_project })
      .exec();
    const phaseProjectDoc = entity.id_phase_project
      ? await this.phaseProjectModel
          .findOne({ id_phase_project: entity.id_phase_project })
          .exec()
      : null;

    const update: any = {
      id_project: entity.id_project,
      id_user: entity.id_user,
      file_name: entity.file_name,
      uri: entity.uri,
      status: EvidenceStatus.CREATED,
      tx_hash: entity.tx_hash ?? undefined,
      id_phase_project: entity.id_phase_project ?? undefined,
    };

    if (userDoc) {
      update.user = userDoc._id;
    }

    if (projectDoc) {
      update.project = projectDoc._id;
    }

    if (phaseProjectDoc) {
      update.phase_project = phaseProjectDoc._id;
    }

    await this.model.updateOne(
      { id_evidence: entity.id_evidence },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        context: "query",
      },
    );
    return entity;
  }

  async findById(id: string): Promise<EvidenceEntity | null> {
    const doc = await this.model.findOne({ id_evidence: id }).lean();
    return doc
      ? new EvidenceEntity(
          doc.id_evidence,
          doc.id_project,
          doc.id_user,
          doc.file_name,
          doc.uri,
          doc.status as any,
          doc.tx_hash,
          (doc as any).createdAt,
        )
      : null;
  }

  async findByProject(
    projectId: string,
    limit = 50,
    offset = 0,
  ): Promise<EvidenceEntity[]> {
    const q: any = {};
    if (projectId) q.id_project = projectId;

    const docs = await this.model
      .find(q)
      .skip(offset ?? 0)
      .limit(limit ?? 50)
      .populate("user")
      .populate("project")
      .populate({
        path: "phase_project",
        populate: {
          path: "phase",
          select: "id_phase name_phase",
        },
      })
      .lean();
    return docs.map((doc: any) => ({
      id_evidence: doc.id_evidence,
      id_project: doc.id_project,
      id_user: doc.id_user,
      file_name: doc.file_name,
      uri: doc.uri,
      status: doc.status,
      tx_hash: doc.tx_hash,
      projectName: doc.project?.name_project ?? null,
      userName: doc.user?.name ?? null,
      surnameName: doc.user?.surname ?? null,
      roleUser: doc.user?.role ?? null,
      idPhase: doc.phase_project?.phase.id_phase ?? null,
      namePhase: doc.phase_project?.phase?.name_phase ?? null,
    }));
  }

  async findAll(params: {
    evidenceId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<EvidenceEntity[]> {
    const q: any = {};
    if (params.evidenceId) q.id_evidence = params.evidenceId;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new EvidenceEntity(
          doc.id_evidence,
          doc.id_project,
          doc.id_user,
          doc.file_name,
          doc.uri,
          doc.status as any,
          doc.tx_hash,
        ),
    );
  }

  async findByProjectAndUser(
    idProject: string,
    idUser: string,
    limit = 50,
    offset = 0,
  ): Promise<EvidenceEntity[]> {
    const q: any = {};
    if (idProject) q.id_project = idProject;
    if (idUser) q.id_user = idUser;

    const docs = await this.model
      .find(q)
      .skip(offset ?? 0)
      .limit(limit ?? 50)
      .populate("user")
      .populate("project")
      .populate({
        path: "phase_project",
        populate: {
          path: "phase",
          select: "id_phase name_phase",
        },
      })
      .lean();
    return docs.map((doc: any) => ({
      id_evidence: doc.id_evidence,
      id_project: doc.id_project,
      id_user: doc.id_user,
      file_name: doc.file_name,
      uri: doc.uri,
      status: doc.status,
      tx_hash: doc.tx_hash,
      projectName: doc.project?.name_project ?? null,
      userName: doc.user?.name ?? null,
      surnameName: doc.user?.surname ?? null,
      roleUser: doc.user?.role ?? null,
      idPhase: doc.phase_project?.phase?.id_phase ?? null,
      namePhase: doc.phase_project?.phase?.name_phase ?? null,
    }));
  }

  async escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async findByProjectAndFileName(
    idProject: string,
    filename: string,
  ): Promise<EvidenceEntity | null> {
    const q: any = {};
    const re = new RegExp(`^${this.escapeRegex(filename)}(\\..+)?$`);

    if (idProject) q.id_project = idProject;
    if (filename) q.file_name = re;
    const doc = await this.model.findOne(q).lean();
    return doc
      ? new EvidenceEntity(
          doc.id_evidence,
          doc.id_project,
          doc.id_user,
          doc.file_name,
          doc.uri,
          doc.status as any,
          doc.tx_hash,
          (doc as any).createdAt,
          doc.id_phase_project,
        )
      : null;
  }

  async existsByPhaseProjectId(id_phase_project: string): Promise<boolean> {
    const exists = await this.model.exists({ id_phase_project });
    return !!exists;
  }

  async findByPhaseProjectId(id_phase_project): Promise<EvidenceEntity[]> {
    const docs = await this.model
      .find({ id_phase_project: id_phase_project })
      .lean();
    return docs.map(
      (doc) =>
        new EvidenceEntity(
          doc.id_evidence,
          doc.id_project,
          doc.id_user,
          doc.file_name,
          doc.uri,
          doc.status as any,
          doc.tx_hash,
        ),
    );
  }
}
