import { Evidence } from "./evidence.entity";

export abstract class EvidenceRepository {
  abstract save(entity: Evidence): Promise<Evidence>;
  abstract findById(id: string): Promise<Evidence | null>;
  abstract findByProject(
    evidenceId: string,
    limit?: number,
    offset?: number,
  ): Promise<Evidence[]>;
  abstract findAll(params: {
    orgId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Evidence[]>;
  abstract findByProjectAndUser(
    idProject: string,
    idUser: string,
    limit?: number,
    offset?: number,
  ): Promise<Evidence[]>;
  abstract findByProjectAndFileName(
    idProject: string,
    filename: string,
  ): Promise<Evidence | null>;
  abstract existsByPhaseProjectId(id_phase_project: string): Promise<boolean>;
  abstract findByPhaseProjectId(
    phaseProjectId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Evidence[]>;
}
