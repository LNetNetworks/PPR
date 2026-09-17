import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Organization as OrganizationDoc } from "../schemas/organization.schema";
import { OrganizationRepository } from "../../../../domain/organizations/organization.repository";
import { Organization as OrganizationEntity } from "../../../../domain/organizations/organization.entity";
@Injectable()
export class OrganizationMongooseRepository extends OrganizationRepository {
  constructor(
    @InjectModel(OrganizationDoc.name)
    private readonly model: Model<OrganizationDoc>,
  ) {
    super();
  }

  async save(entity: OrganizationEntity): Promise<OrganizationEntity> {
    await this.model.updateOne(
      { id_organization: entity.id_organizations },
      entity,
      { upsert: true },
    );
    return entity;
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    const doc = await this.model.findOne({ id_organization: id }).lean();
    return doc
      ? new OrganizationEntity(
          doc.id_organization,
          doc.name_organization,
          doc.date_registration,
          doc.address_organization,
          doc.did_organization,
        )
      : null;
  }

  async findAll(params: {
    orgId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrganizationEntity[]> {
    const q: any = {};
    if (params.orgId) q.id_organization = params.orgId;
    if (params.status) q.status = params.status;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new OrganizationEntity(
          doc.id_organization,
          doc.name_organization,
          doc.date_registration,
          doc.address_organization,
          doc.did_organization,
        ),
    );
  }
  async delete(id: string) {
    await this.model.deleteOne({ id_organization: id });
  }
}
