import { User } from "./user.entity";

export abstract class UserRepository {
  abstract save(User: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findAll(params: {
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;
  abstract delete(id: string): Promise<void>;
  abstract findByKeycloakSub(sub: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User[]>;
  abstract findByRole(role: string): Promise<User | null>;
}
