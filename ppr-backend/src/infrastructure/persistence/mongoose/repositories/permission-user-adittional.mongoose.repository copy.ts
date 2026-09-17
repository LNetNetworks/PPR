import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PermissionUserAdittional as PermissionUserAdittionalDoc } from "../schemas/permission-user-adittional.schema";
import { PermissionUserAdittionalRepository } from "../../../../domain/permissions/permission-user-adittional.repository";
import { PermissionUserAdittional as PermissionUserAdittionalEntity } from "../../../../domain/permissions/permission-user-adittional.entity";
import { PhaseProject as PhaseProjectDoc } from "../schemas/phase-project.schema";
import { User as UserDoc } from "../schemas/user.schema";
import { Permission as PermissionDoc } from "../schemas/permission.schema";

@Injectable()
export class PermissionUserAdittionalMongooseRepository extends PermissionUserAdittionalRepository {
  constructor(
    @InjectModel(PermissionUserAdittionalDoc.name)
    private readonly model: Model<PermissionUserAdittionalDoc>,
    @InjectModel(PhaseProjectDoc.name)
    private readonly phaseProjectModel: Model<PhaseProjectDoc>,
    @InjectModel(UserDoc.name) private readonly userModel: Model<UserDoc>,
    @InjectModel(PermissionDoc.name)
    private readonly permissionModel: Model<PermissionDoc>,
  ) {
    super();
  }

  async save(
    entity: PermissionUserAdittionalEntity,
  ): Promise<PermissionUserAdittionalEntity> {
    const userDoc = await this.userModel
      .findOne({ id_user: entity.id_user })
      .exec();
    const permissionDoc = await this.permissionModel
      .findOne({ id_permission: entity.id_permission })
      .exec();

    const update: any = {
      id_permission_user_adittional: entity.id_permission_user_adittional,
      id_user: entity.id_user,
      id_permission: entity.id_permission,
      type: entity.type,
    };

    if (permissionDoc) {
      update.phase_project = permissionDoc._id;
    }
    if (userDoc) {
      update.task = userDoc._id;
    }
    await this.model.updateOne(
      { id_permission_user_adittional: entity.id_permission_user_adittional },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }

  async findById(id: string): Promise<PermissionUserAdittionalEntity | null> {
    const doc = await this.model
      .findOne({ id_permission_user_adittional: id })
      .lean();
    return doc
      ? new PermissionUserAdittionalEntity(
          doc.id_permission_user_adittional,
          doc.id_user,
          doc.id_permission,
          doc.type,
        )
      : null;
  }

  async findAll(params: {
    idPermissionUserAdittional?: string;
    limit?: number;
    offset?: number;
  }): Promise<PermissionUserAdittionalEntity[]> {
    const q: any = {};
    if (params.idPermissionUserAdittional)
      q.id_permission_user_adittional = params.idPermissionUserAdittional;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new PermissionUserAdittionalEntity(
          doc.id_permission_user_adittional,
          doc.id_user,
          doc.id_permission,
          doc.type as any,
        ),
    );
  }
}
