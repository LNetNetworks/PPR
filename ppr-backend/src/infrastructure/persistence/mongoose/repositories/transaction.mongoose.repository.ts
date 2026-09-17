import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Transaction as TransactionDoc } from "../schemas/transaction.schema";
import { TransactionRepository } from "../../../../domain/transactions/transaction.repository";
import { Transaction as TransactionEntity } from "../../../../domain/transactions/transaction.entity";
import { Project as ProjectDoc } from "../schemas/project.schema";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";
import { PhaseProjectTask as PhaseProjectTaskDoc } from "../schemas/phase-project-task.schema";
import { User as UserDoc } from "../schemas/user.schema";
import { TransactionTypes } from "../../../../domain/transactions/transaction-types.enum";

@Injectable()
export class TransactionMongooseRepository extends TransactionRepository {
  constructor(
    @InjectModel(TransactionDoc.name)
    private readonly model: Model<TransactionDoc>,
    @InjectModel(UserDoc.name)
    private readonly userModel: Model<TransactionDoc>,
    @InjectModel(ProjectDoc.name)
    private readonly projectModel: Model<TransactionDoc>,
    @InjectModel(PhaseProjectDoc.name)
    private readonly phaseProjectModel: Model<TransactionDoc>,
    @InjectModel(PhaseProjectTaskDoc.name)
    private readonly phaseProjectTaskModel: Model<TransactionDoc>,
  ) {
    super();
  }

  async save(entity: TransactionEntity): Promise<TransactionEntity> {
    const update: any = {
      id_transaction: entity.id_transaction,
      id_project: entity.id_project,
      id_user: entity.id_user,
      result_transaction: entity.result_transaction,
      transaction_date: entity.transaction_date,
      transaction_type: entity.transaction_type,
      id_phase_project: entity.id_phase_project,
      id_phase_project_task: entity.id_phase_project_task,
      comment: entity.comment,
    };

    if (entity.id_phase_project) {
      const phaseProjectDoc = await this.phaseProjectModel
        .findOne({ id_phase_project: entity.id_phase_project })
        .exec();
      if (phaseProjectDoc) {
        update.phase_project = phaseProjectDoc._id;
      }
    }

    if (entity.id_phase_project_task) {
      const phaseProjectTaskDoc = await this.phaseProjectTaskModel
        .findOne({ id_phase_project_task: entity.id_phase_project_task })
        .exec();
      if (phaseProjectTaskDoc) {
        update.phase_project_task = phaseProjectTaskDoc._id;
      }
    }

    if (entity.id_user) {
      const userDoc = await this.userModel
        .findOne({ id_user: entity.id_user })
        .exec();
      if (userDoc) {
        update.user = userDoc._id;
      }
    }

    await this.model.updateOne(
      { id_transaction: entity.id_transaction },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }
  async findById(id: string): Promise<TransactionEntity | null> {
    const doc = await this.model.findOne({ id_transaction: id }).lean();
    return doc
      ? new TransactionEntity(
          doc.id_transaction,
          doc.id_project,
          doc.id_user,
          doc.result_transaction,
          doc.transaction_date,
          doc.transaction_type,
          doc.id_phase_project,
          doc.id_phase_project_task,
          doc.comment,
        )
      : null;
  }

  async findAll(params: {
    projectId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionEntity[]> {
    const q: any = {};
    if (params.projectId) q.id_project = params.projectId;
    if (params.userId) q.id_user = params.userId;

    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new TransactionEntity(
          doc.id_transaction,
          doc.id_project,
          doc.id_user,
          doc.result_transaction,
          doc.transaction_date,
          doc.transaction_type,
          doc.id_phase_project,
          doc.id_phase_project_task,
          doc.comment,
        ),
    );
  }

  async findByProject(params: {
    projectId?: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionEntity[]> {
    const q: any = {};
    if (params.projectId && params.projectId !== "undefined") {
      q.$or = [
        { id_project: params.projectId },
        {
          id_project: "n/a",
          result_transaction: new RegExp(params.projectId, "i"),
        },
      ];
    } else if (params.projectId) {
      q.id_project = params.projectId;
    }
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .populate("project")
      .populate("user")
      .populate({
        path: "phase_project",
        populate: {
          path: "phase",
          select: "name_phase",
        },
      })
      .populate({
        path: "phase_project_task",
        populate: {
          path: "task",
          select: "name_task",
        },
      })
      .lean();

    return docs.map((doc: any) => ({
      id_project: doc.id_project,
      id_user: doc.id_user,
      id_transaction: doc.id_transaction,
      result_transaction: doc.result_transaction,
      transaction_date: doc.transaction_date,
      transaction_type: doc.transaction_type,
      id_phase_project: doc.id_phase_project,
      id_phase_project_task: doc.id_phase_project_task,
      comment: doc.comment,
      projectName: doc.project?.name_project ?? null,
      userName: doc.user?.name ?? null,
      surnameName: doc.user?.surname ?? null,
      roleUser: doc.user?.role ?? null,
      namePhase: doc.phase_project?.phase?.name_phase ?? null,
      namePhaseTash: doc.phase_project_task?.task?.name_task ?? null,
    }));
  }

  async findByProjectAndType(params: {
    projectId?: string;
    typeTransaction?: TransactionTypes;
    limit?: number;
    offset?: number;
  }): Promise<TransactionEntity[]> {
    const q: any = {};
    if (params.projectId) q.id_project = params.projectId;
    if (params.typeTransaction) q.transaction_type = params.typeTransaction;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .populate("project")
      .populate("user")
      .populate({
        path: "phase_project",
        populate: {
          path: "phase",
          select: "name_phase",
        },
      })
      .populate({
        path: "phase_project_task",
        populate: {
          path: "task",
          select: "name_task",
        },
      })
      .lean();

    return docs.map((doc: any) => ({
      id_project: doc.id_project,
      id_user: doc.id_user,
      id_transaction: doc.id_transaction,
      result_transaction: doc.result_transaction,
      transaction_date: doc.transaction_date,
      transaction_type: doc.transaction_type,
      id_phase_project: doc.id_phase_project,
      id_phase_project_task: doc.id_phase_project_task,
      comment: doc.comment,
      projectName: doc.project?.name_project ?? null,
      userName: doc.user?.name ?? null,
      surnameName: doc.user?.surname ?? null,
      roleUser: doc.user?.role ?? null,
      namePhase: doc.phase_project?.phase?.name_phase ?? null,
      namePhaseTash: doc.phase_project_task?.task?.name_task ?? null,
    }));
  }

  async delete(id: string) {
    await this.model.deleteOne({ id_transaction: id });
  }
}
