import { EvidenceStatus } from "./evidence-status.enum";

export class Evidence {
  constructor(
    public readonly id_evidence: string,
    public readonly id_project: string,
    public readonly id_user: string,
    public readonly file_name: string,
    public readonly uri: string,
    public readonly status: EvidenceStatus = EvidenceStatus.EMPTY,
    public readonly tx_hash?: string,
    public readonly created_at?: Date,
    public readonly id_phase_project?: string,
  ) {}
}
