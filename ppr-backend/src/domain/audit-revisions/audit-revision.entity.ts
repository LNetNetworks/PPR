import { AuditStatus } from "./audit-revision-status.enum";

export class AuditRevision {
  constructor(
    public objetive: string,
    public readonly id_revision: string,
    public id_user: string,
    public id_project: string,
    public observation: string,
    public date_revision: Date,
    public id_phase_project: string,
    public status: AuditStatus,
  ) {}
}
