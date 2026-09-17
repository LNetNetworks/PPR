import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contribution as ContributionDoc } from "../schemas/contribution.schema";
import { Project as ProjectDoc } from "../schemas/project.schema";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";
import { User as UserDoc } from "../schemas/user.schema";
import { ContributionRepository } from "../../../../domain/contributions/contribution.repository";
import { Contribution as ContributionEntity } from "../../../../domain/contributions/contribution.entity";
@Injectable()
export class ContributionMongooseRepository extends ContributionRepository {
  constructor(
    @InjectModel(ContributionDoc.name)
    private readonly model: Model<ContributionDoc>,
    @InjectModel(ProjectDoc.name)
    private readonly projectModel: Model<ProjectDoc>,
    @InjectModel(UserDoc.name) private readonly userModel: Model<UserDoc>,
    @InjectModel(PhaseProjectDoc.name)
    private readonly phaseProjectModel: Model<PhaseProjectDoc>,
  ) {
    super();
  }

  async save(entity: ContributionEntity): Promise<ContributionEntity> {
    const projectDoc = await this.projectModel
      .findOne({ id_project: entity.id_project })
      .exec();
    const userDoc = await this.userModel
      .findOne({ id_user: entity.id_user })
      .exec();
    const phasProjectDoc = await this.phaseProjectModel
      .findOne({ id_phase_project: entity.id_phase_project })
      .exec();

    const update: any = {
      id_contribution: entity.id_contribution,
      id_project: entity.id_project,
      id_user: entity.id_user,
      deposit_amount: entity.deposit_amount,
      id_phase_project: entity.id_phase_project,
      date_contribution: entity.date_contribution,
    };

    if (projectDoc) {
      update.project = projectDoc._id;
    }

    if (userDoc) {
      update.user = userDoc._id;
    }

    if (phasProjectDoc) {
      update.phase_project = phasProjectDoc._id;
    }

    await this.model.updateOne(
      { id_contribution: entity.id_contribution },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }

  async findById(id: string): Promise<ContributionEntity | null> {
    const doc = await this.model.findOne({ id_contribution: id }).lean();
    return doc
      ? new ContributionEntity(
          doc.id_contribution,
          doc.id_project,
          doc.id_user,
          doc.deposit_amount,
          doc.id_phase_project,
          doc.date_contribution,
        )
      : null;
  }

  async findAll(params: {
    limit?: number;
    offset?: number;
    projectId?: string;
  }): Promise<ContributionEntity[]> {
    const q: any = {};
    if (params.projectId) q.id_project = params.projectId;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .populate("user")
      .populate("project")
      .populate({
        path: "phase_project",
        populate: {
          path: "phase",
          select: "name_phase",
        },
      })
      .lean();

    return docs.map((doc: any) => ({
      id_contribution: doc.id_contribution,
      id_project: doc.id_project,
      id_user: doc.id_user,
      deposit_amount: doc.deposit_amount,
      id_phase_project: doc.id_phase_project,
      date_contribution: doc.date_contribution,
      contribution_required: doc.contribution_required,
      contribution_received: doc.contribution_received,
      userName: doc.user?.name ?? null,
      userSurname: doc.user?.surname ?? null,
      phaseProjectContribReceived:
        doc.phase_project?.contribution_received ?? null,
      phaseProjectContribRequired:
        doc.phase_project?.contribution_required ?? null,
      namePhase: doc.phase_project?.phase?.name ?? null,
    }));
  }
  async delete(id: string) {
    await this.model.deleteOne({ id_contribution: id });
  }

  async existsByPhaseProjectId(id_phase_project: string): Promise<boolean> {
    const exists = await this.model.exists({ id_phase_project });
    return !!exists;
  }

  async findByPhaseProjectId(id_phase_project): Promise<ContributionEntity[]> {
    const docs = await this.model
      .find({ id_phase_project: id_phase_project })
      .lean();
    return docs.map(
      (doc) =>
        new ContributionEntity(
          doc.id_contribution,
          doc.id_project,
          doc.id_user,
          doc.deposit_amount,
          doc.id_phase_project,
          doc.date_contribution,
        ),
    );
  }
}
