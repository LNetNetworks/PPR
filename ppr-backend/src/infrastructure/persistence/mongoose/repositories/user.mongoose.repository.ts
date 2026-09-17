import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User as UserDoc } from "../schemas/user.schema";
import { UserRepository } from "../../../../domain/users/user.repository";
import { User as UserEntity } from "../../../../domain/users/user.entity";
import { UserRole } from "../../../../domain/users/user-role.enum";

@Injectable()
export class UserMongooseRepository extends UserRepository {
  constructor(
    @InjectModel(UserDoc.name) private readonly model: Model<UserDoc>,
  ) {
    super();
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    await this.model.updateOne({ id_user: entity.id_user }, entity, {
      upsert: true,
    });
    return entity;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ id_user: id }).lean();
    return doc
      ? new UserEntity(
          doc.id_user,
          doc.id_organization,
          doc.name,
          doc.surname,
          doc.address_street,
          doc.address_number,
          doc.address_state,
          doc.address_country,
          doc.user_email,
          doc.phone_mobile,
          doc.active,
          doc.birthday,
          doc.role as any,
          doc.address_seed_token,
          doc.wallet_address_token,
          doc.did_user,
          doc.keycloak_sub,
          doc.apikeypok,
        )
      : null;
  }

  async findAll(params: {
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserEntity[]> {
    const q: any = {};
    if (params.userId) q.id_user = params.userId;
    const docs = await this.model
      .find(q)
      .skip(params.offset ?? 0)
      .limit(params.limit ?? 50)
      .lean();
    return docs.map(
      (doc) =>
        new UserEntity(
          doc.id_user,
          doc.id_organization,
          doc.name,
          doc.surname,
          doc.address_street,
          doc.address_number,
          doc.address_state,
          doc.address_country,
          doc.user_email,
          doc.phone_mobile,
          doc.active,
          doc.birthday,
          doc.role as any,
          doc.address_seed_token,
          doc.wallet_address_token,
          doc.did_user,
          doc.keycloak_sub,
          doc.apikeypok,
        ),
    );
  }

  async delete(id: string) {
    await this.model.deleteOne({ id_user: id });
  }

  async findByKeycloakSub(sub: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ keycloak_sub: sub }).lean();
    return doc
      ? new UserEntity(
          doc.id_user,
          doc.id_organization,
          doc.name,
          doc.surname,
          doc.address_street,
          doc.address_number,
          doc.address_state,
          doc.address_country,
          doc.user_email,
          doc.phone_mobile,
          doc.active,
          doc.birthday,
          doc.role as any,
          doc.address_seed_token,
          doc.wallet_address_token,
          doc.did_user,
          doc.keycloak_sub,
          doc.apikeypok,
        )
      : null;
  }

  async findByEmail(email: string): Promise<UserEntity[]> {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const docs = await this.model
      .find({
        $and: [
          { user_email: { $regex: escapedEmail, $options: "i" } },
          { keycloak_sub: { $exists: true, $nin: [null, ""] } },
        ],
      })
      .lean();

    if (!docs || docs.length === 0) {
      console.log(`User not found: ${email}`);
      return [];
    }
    return docs.map(
      (doc) =>
        new UserEntity(
          doc.id_user,
          doc.id_organization,
          doc.name,
          doc.surname,
          doc.address_street,
          doc.address_number,
          doc.address_state,
          doc.address_country,
          doc.user_email,
          doc.phone_mobile,
          doc.active,
          doc.birthday,
          doc.role as any,
          doc.address_seed_token,
          doc.wallet_address_token,
          doc.did_user,
          doc.keycloak_sub,
          doc.apikeypok,
        ),
    );
  }

  async upsertFromKeycloak(payload: {
    id_user: string;
    keycloak_sub: string;
    email?: string;
    name?: string;
    surname?: string;
    active?: boolean;
    role?: UserRole.USER;
  }): Promise<UserEntity> {
    const doc = await this.model
      .findOneAndUpdate(
        { keycloak_sub: payload.keycloak_sub },
        {
          $setOnInsert: { id_user: payload.id_user },
          $set: {
            keycloak_sub: payload.keycloak_sub,
            user_email: payload.email,
            name: payload.name,
            surname: payload.surname,
            active: payload.active ?? true,
            role: payload.role,
          },
        },
        { new: true, upsert: true },
      )
      .lean();

    return doc;
  }

  async findByRole(role: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ role: role }).lean();
    return doc
      ? new UserEntity(
          doc.id_user,
          doc.id_organization,
          doc.name,
          doc.surname,
          doc.address_street,
          doc.address_number,
          doc.address_state,
          doc.address_country,
          doc.user_email,
          doc.phone_mobile,
          doc.active,
          doc.birthday,
          doc.role as any,
          doc.address_seed_token,
          doc.wallet_address_token,
          doc.did_user,
          doc.keycloak_sub,
          doc.apikeypok,
        )
      : null;
  }
}
