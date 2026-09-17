import { Revision } from "./revision.entity";

export abstract class RevisionRepository {
  abstract save(Revision: Revision): Promise<Revision>;
  abstract findById(id: string): Promise<Revision | null>;
  abstract findAll(params: {
    orgId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Revision[]>;
  abstract delete(id: string): Promise<void>;
}
