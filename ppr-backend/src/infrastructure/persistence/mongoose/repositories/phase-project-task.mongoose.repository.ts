import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PhaseProjectTask as PhaseProjectTaskDoc } from "../schemas/phase-project-task.schema";
import { PhaseProjectTaskRepository } from "../../../../domain/phases/phase-project-task.repository";
import { PhaseProjectTask as PhaseProjectTaskEntity } from "../../../../domain/phases/phase-project-task.entity";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";
import { Task as TaskDoc } from "../schemas/task.schema";

@Injectable()
export class PhaseProjectTaskMongooseRepository extends PhaseProjectTaskRepository {
  constructor(
    @InjectModel(PhaseProjectTaskDoc.name)
    private readonly model: Model<PhaseProjectTaskDoc>,
    @InjectModel(PhaseProjectDoc.name)
    private readonly phaseProjectModel: Model<PhaseProjectDoc>,
    @InjectModel(TaskDoc.name) private readonly taskModel: Model<TaskDoc>,
  ) {
    super();
  }

  async save(entity: PhaseProjectTaskEntity): Promise<PhaseProjectTaskEntity> {
    const phaseProjectDoc = await this.phaseProjectModel
      .findOne({ id_phase_project: entity.id_phase_project })
      .exec();
    const taskDoc = await this.taskModel
      .findOne({ id_task: entity.id_task })
      .exec();

    const update: any = {
      id_phase_project_task: entity.id_phase_project_task,
      id_phase_project: entity.id_phase_project,
      id_task: entity.id_task,
      status_task: entity.status_task,
    };

    if (phaseProjectDoc) {
      update.phase_project = phaseProjectDoc._id;
    }
    if (taskDoc) {
      update.task = taskDoc._id;
    }
    await this.model.updateOne(
      { id_phase_project_task: entity.id_phase_project_task },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }

  async findById(id: string): Promise<PhaseProjectTaskEntity | null> {
    const doc = await this.model.findOne({ id_phase_project_task: id }).lean();
    return doc
      ? new PhaseProjectTaskEntity(
          doc.id_phase_project_task,
          doc.id_phase_project,
          doc.id_task,
          doc.status_task as any,
        )
      : null;
  }

  async findAll(params: {
    phaseTaskId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PhaseProjectTaskEntity[]> {
    const q: any = {};
    if (params.phaseTaskId) q.id_phase_task = params.phaseTaskId;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new PhaseProjectTaskEntity(
          doc.id_phase_project_task,
          doc.id_phase_project,
          doc.id_task,
          doc.status_task as any,
        ),
    );
  }

  async findByPhaseProjectTask(
    phaseProjectId: string,
    taskId: string,
  ): Promise<PhaseProjectTaskEntity | null> {
    const doc = await this.model
      .findOne({ id_phase_project: phaseProjectId, id_task: taskId })
      .lean();
    return doc
      ? new PhaseProjectTaskEntity(
          doc.id_phase_project_task,
          doc.id_phase_project,
          doc.id_task,
          doc.status_task as any,
        )
      : null;
  }

  async findByPhaseProjectId(
    phaseProjectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<PhaseProjectTaskEntity[]> {
    const docs = await this.model
      .find({ id_phase_project: phaseProjectId })
      .populate("task")
      .skip(params?.offset ?? 0)
      .limit(params?.limit ?? 50)
      .lean();

    return docs.map(
      (doc: any) =>
        new PhaseProjectTaskEntity(
          doc.id_phase_project_task,
          doc.id_phase_project,
          doc.id_task,
          doc.status_task,
        ),
    );
  }

  async findAllTaskOfPhaseProject(
    phaseProjectId: string,
    projectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<PhaseProjectTaskEntity[]> {
    const q: any = {};
    if (phaseProjectId) q.id_phase_project = phaseProjectId;
    const docs = await this.model
      .find(q)
      .populate("task")
      .populate({
        path: "phase_project",
        populate: [
          {
            path: "phase",
            select: "name_phase",
          },
          {
            path: "project",
            select: "name_project",
          },
        ],
      })
      .skip(params?.offset ?? 0)
      .limit(params?.limit ?? 50)
      .lean();
    return docs.map((doc: any) => ({
      id_phase_project_task: doc.id_phase_project_task,
      id_phase_project: doc.id_phase_project,
      id_task: doc.id_task,
      status_task: doc.status_task,
      task_nameTask: doc.task?.name_task ?? null,
      phase_Phaseproject: doc.phase_project?.phase?.name_phase ?? null,
      project_nameProject: doc.phase_project?.project?.name_project ?? null,
    }));
  }
}
