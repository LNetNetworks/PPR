import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PermissionRole as PermissionRoleDoc } from "../schemas/permission-role.schema";
import { PermissionRoleRepository } from "../../../../domain/permissions/permission-role.repository";
import { PermissionRole as PermissionRoleEntity } from "../../../../domain/permissions/permission-role.entity";
import { Permission } from "../schemas/permission.schema";

@Injectable()
export class PermissionRoleMongooseRepository extends PermissionRoleRepository {
  constructor(
    @InjectModel(PermissionRoleDoc.name)
    private readonly model: Model<PermissionRoleDoc>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {
    super();
  }

  async save(entity: PermissionRoleEntity): Promise<PermissionRoleEntity> {
    const permissionDoc = await this.permissionModel
      .findOne({ id_permission: entity.id_permission })
      .exec();
    const update: any = {
      id_permission_role: entity.id_permission_role,
      id_permission: entity.id_permission,
      role: entity.role,
    };

    if (permissionDoc) {
      update.permission = permissionDoc._id;
    }

    await this.model.updateOne(
      { id_permission_role: entity.id_permission_role },
      { $set: update },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return entity;
  }

  async findById(id: string): Promise<PermissionRoleEntity | null> {
    const doc = await this.model.findOne({ id_permission_role: id }).lean();
    return doc
      ? new PermissionRoleEntity(
          doc.id_permission_role,
          doc.id_permission,
          doc.role,
        )
      : null;
  }

  async findAll(params: {
    limit?: number;
    offset?: number;
    permissionId?: string;
  }): Promise<PermissionRoleEntity[]> {
    const q: any = {};
    if (params.permissionId) q.id_permission_role = params.permissionId;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .populate("permission")
      .lean();

    return docs.map((doc: any) => ({
      id_permission_role: doc.id_permission_role,
      id_permission: doc.id_permission,
      role: doc.role,
      permissionName: doc.permission?.name ?? null,
    }));
  }
}
