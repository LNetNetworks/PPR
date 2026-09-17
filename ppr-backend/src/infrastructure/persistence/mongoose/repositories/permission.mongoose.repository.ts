import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permission as PermissionDoc } from "../schemas/permission.schema";
import { PermissionRepository } from "../../../../domain/permissions/permission.repository";
import { Permission as PermissionEntity } from "../../../../domain/permissions/permission.entity";

@Injectable()
export class PermissionMongooseRepository extends PermissionRepository {
  constructor(
    @InjectModel(PermissionDoc.name)
    private readonly model: Model<PermissionDoc>,
  ) {
    super();
  }

  async save(entity: PermissionEntity): Promise<PermissionEntity> {
    await this.model.updateOne(
      { id_Permission: entity.id_permission },
      entity,
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return entity;
  }

  async findById(id: string): Promise<PermissionEntity | null> {
    const doc = await this.model.findOne({ id_permission: id }).lean();
    return doc
      ? new PermissionEntity(
          doc.id_permission,
          doc.name_permission,
          doc.description_permission,
        )
      : null;
  }

  async findAll(params: {
    id_permission?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PermissionEntity[]> {
    const q: any = {};
    if (params.id_permission) q.id_permission = params.id_permission;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new PermissionEntity(
          doc.id_permission,
          doc.name_permission,
          doc.description_permission,
        ),
    );
  }
}
