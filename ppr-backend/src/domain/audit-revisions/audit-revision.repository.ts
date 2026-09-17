import { AuditRevision } from "./audit-revision.entity";

export abstract class AuditRevisionRepository {
  abstract save(AuditRevision: AuditRevision): Promise<AuditRevision>;
  abstract findById(id: string): Promise<AuditRevision | null>;
  abstract findAll(params: {
    idAudit?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditRevision[]>;
  abstract delete(id: string): Promise<void>;
  abstract existsByPhaseProjectId(id_phase_project: string): Promise<boolean>;
  abstract findByPhaseProject(
    id_phase_project: string,
  ): Promise<AuditRevision[]>;
}
