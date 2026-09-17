export abstract class EvidenceBlockchainPort {
  abstract deployCertification(): Promise<{ address: string; hash: string }>;
  abstract addDoc(
    contractAddress: string,
    docHash: string,
    uidHash: string,
  ): Promise<{ res: any }>;
}
