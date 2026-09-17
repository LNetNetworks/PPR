import { Injectable } from "@nestjs/common";
import { EvidenceCheckerPort } from "../ports/evidence-checker-port";
import { ExternalApiClient } from "../../../infrastructure/integrations/external-api.client";

@Injectable()
export class EvidenceCheckerService implements EvidenceCheckerPort {
  constructor(private readonly client: ExternalApiClient) {}
  async check(evidenceId: string, payload: any) {
    const res = await this.client.post("https://test.com/evidence/check", {
      evidenceId,
      payload,
    });
    return { valid: !!res?.valid, details: res };
  }
}
