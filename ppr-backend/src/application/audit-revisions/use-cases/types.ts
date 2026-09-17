import { AuditStatus } from "../../../domain/audit-revisions/audit-revision-status.enum";

export interface CreateAuditRevisionInput {
  objetive: string;
  id_user: string;
  id_project: string;
  observation: string;
  date_revision: Date;
  id_phase_project: string;
  status: AuditStatus;
}

export interface UpdateAuditRevisionInput {
  objetive: string;
  id_user: string;
  id_project: string;
  observation: string;
  date_revision: Date;
  id_phase_project: string;
  status: AuditStatus;
}
