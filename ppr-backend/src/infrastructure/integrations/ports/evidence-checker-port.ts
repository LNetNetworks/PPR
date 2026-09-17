export interface EvidenceCheckerPort {
  check(
    evidenceId: string,
    payload: any,
  ): Promise<{ valid: boolean; details?: any }>;
}
