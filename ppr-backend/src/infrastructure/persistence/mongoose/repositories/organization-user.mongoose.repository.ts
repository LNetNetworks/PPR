import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrganizationUser as OrganizationUserDoc } from "../schemas/organization-user.schema";
import { OrganizationUserRepository } from "../../../../domain/organizations/organization-user.repository";
import { OrganizationUser as OrganizationUserEntity } from "../../../../domain/organizations/organization-user.entity";
@Injectable()
export class OrganizationUserMongooseRepository extends OrganizationUserRepository {
  constructor(
    @InjectModel(OrganizationUserDoc.name)
    private readonly model: Model<OrganizationUserDoc>,
  ) {
    super();
  }

  async save(entity: OrganizationUserEntity): Promise<OrganizationUserEntity> {
    await this.model.updateOne(
      { id_organization_user: entity.id_organization_user },
      entity,
      { upsert: true },
    );
    return entity;
  }

  async findById(id: string): Promise<OrganizationUserEntity | null> {
    const doc = await this.model.findOne({ id_organization_user: id }).lean();
    return doc
      ? new OrganizationUserEntity(
          doc.id_organization_user,
          doc.id_organization,
          doc.id_user,
          doc.role as any,
        )
      : null;
  }

  async findAll(params: {
    orgId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrganizationUserEntity[]> {
    const q: any = {};
    if (params.orgId) q.id_OrganizationUser = params.orgId;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new OrganizationUserEntity(
          doc.id_organization_user,
          doc.id_organization,
          doc.id_user,
          doc.role as any,
        ),
    );
  }
  async delete(id: string) {
    await this.model.deleteOne({ id_OrganizationUser: id });
  }
}
