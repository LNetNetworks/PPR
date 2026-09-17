import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";
import { PhaseProjectRepository } from "../../../../domain/phases/phase-project.repository";
import { PhaseProject as PhaseProjectEntity } from "../../../../domain/phases/phase-project.entity";
import { Phase } from "../schemas/phase.schema";
import { Project } from "../schemas/project.schema";

@Injectable()
export class PhaseProjectMongooseRepository extends PhaseProjectRepository {
  constructor(
    @InjectModel(PhaseProjectDoc.name)
    private readonly model: Model<PhaseProjectDoc>,
    @InjectModel(Phase.name)
    private readonly phaseModel: Model<Phase>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {
    super();
  }

  async save(entity: PhaseProjectEntity): Promise<PhaseProjectEntity> {
    const phaseDoc = await this.phaseModel
      .findOne({ id_phase: entity.id_phase })
      .exec();
    const projectDoc = await this.projectModel
      .findOne({ id_project: entity.id_project })
      .exec();

    const update: any = {
      id_phase_project: entity.id_phase_project,
      id_phase: entity.id_phase,
      id_project: entity.id_project,
      require_evidence: entity.require_evidence,
      status: entity.status,
      order: entity.order,
      stage_weight: entity.stage_weight,
      contribution_required: entity.contribution_required,
      contribution_received: entity.contribution_received,
      date_start: entity.date_start,
      date_end: entity.date_end,
      type: entity.type,
      require_auditory: entity.require_auditory,
      require_contribution: entity.require_contribution,
      close_auditory: entity.close_auditory,
      close_contribution: entity.close_contribution,
      close_evidence: entity.close_evidence,
    };

    if (phaseDoc) {
      update.phase = phaseDoc._id;
    }

    if (projectDoc) {
      update.project = projectDoc._id;
    }

    await this.model.updateOne(
      { id_phase_project: entity.id_phase_project },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }

  async findById(id: string): Promise<PhaseProjectEntity | null> {
    const doc = await this.model.findOne({ id_phase_project: id }).lean();
    return doc
      ? new PhaseProjectEntity(
          doc.id_phase_project,
          doc.id_phase,
          doc.id_project,
          doc.require_evidence,
          doc.status as any,
          doc.order,
          doc.stage_weight,
          doc.contribution_required,
          doc.contribution_received,
          doc.date_start,
          doc.date_end,
          doc.type as any,
          doc.require_auditory,
          doc.require_contribution,
          doc.close_auditory,
          doc.close_contribution,
          doc.close_evidence,
          doc.description,
        )
      : null;
  }

  async findAll(params: {
    limit?: number;
    offset?: number;
    prjId?: string;
  }): Promise<PhaseProjectEntity[]> {
    const q: any = {};
    if (params.prjId) q.id_project = params.prjId;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .populate("phase")
      .populate("project")
      .lean();

    return docs.map((doc: any) => ({
      id_phase_project: doc.id_phase_project,
      id_phase: doc.id_phase,
      id_project: doc.id_project,
      require_evidence: doc.require_evidence,
      status: doc.status,
      order: doc.order,
      stage_weight: doc.stage_weight,
      contribution_required: doc.contribution_required,
      contribution_received: doc.contribution_received,
      date_start: doc.date_start,
      date_end: doc.date_end,
      type: doc.type,
      require_auditory: doc.require_auditory,
      require_contribution: doc.require_contribution,
      close_auditory: doc.close_auditory,
      close_contribution: doc.close_contribution,
      close_evidence: doc.close_evidence,
      description: doc.description,
      phaseName: doc.phase?.name_phase ?? null,
      projectName: doc.project?.name_project ?? null,
    }));
  }

  async findByPhase(params: {
    phaseId: string;
    projectId: string;
  }): Promise<PhaseProjectEntity | null> {
    const doc = await this.model
      .findOne({ id_phase: params.phaseId, id_project: params.projectId })
      .lean();

    return doc
      ? new PhaseProjectEntity(
          doc.id_phase_project,
          doc.id_phase,
          doc.id_project,
          doc.require_evidence,
          doc.status as any,
          doc.order,
          doc.stage_weight,
          doc.contribution_required,
          doc.contribution_received,
          doc.date_start,
          doc.date_end,
          doc.type as any,
          doc.require_auditory,
          doc.require_contribution,
          doc.close_auditory,
          doc.close_contribution,
          doc.close_evidence,
          doc.description,
        )
      : null;
  }

  async findByProject(projectId: string): Promise<PhaseProjectEntity[]> {
    const q: any = {};
    if (projectId) q.id_project = projectId;
    const docs = await this.model.find(q).lean();

    return docs.map((doc: any) => ({
      id_phase_project: doc.id_phase_project,
      id_phase: doc.id_phase,
      id_project: doc.id_project,
      require_evidence: doc.require_evidence,
      status: doc.status,
      order: doc.order,
      stage_weight: doc.stage_weight,
      contribution_required: doc.contribution_required,
      contribution_received: doc.contribution_received,
      date_start: doc.date_start,
      date_end: doc.date_end,
      type: doc.type,
      require_auditory: doc.require_auditory,
      require_contribution: doc.require_contribution,
      close_auditory: doc.close_auditory,
      close_contribution: doc.close_contribution,
      close_evidence: doc.close_evidence,
      description: doc.description,
    }));
  }
}
