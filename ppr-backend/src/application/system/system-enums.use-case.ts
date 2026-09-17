import { Injectable } from "@nestjs/common";

import { AuditStatus } from "../../domain/audit-revisions/audit-revision-status.enum";
import { EvidenceStatus } from "../../domain/evidences/evidence-status.enum";
import { PhaseProjectStatus } from "../../domain/phases/phase-project-status.enum";
import { PhaseProjectTaskStatus } from "../../domain/phases/phase-project-task-status.enum";
import { ProjectStatus } from "../../domain/projects/project-status.enum";
import { ProjectTypes } from "../../domain/projects/project-types.enum";
import { PhaseType } from "../../domain/phases/phase-type.enum";
import { AssetTokenSymbol } from "../../domain/projects/project-asset-token.enum";
import { TypeCurrency } from "../../domain/projects/project-type-currency.enum";

type EnumItem = { key: string; value: string | number };
export type EnumBag = Record<string, EnumItem[]>;

@Injectable()
export class SystemEnumsUseCase {
  private readonly aliases: Record<string, string> = {
    "project-status": "ProjectStatus",
    "project-types": "ProjectTypes",
    "evidence-status": "EvidenceStatus",
    "phase-project-status": "PhaseProjectStatus",
    "phase-task-status": "PhaseProjectTaskStatus",
    "audit-status": "AuditStatus",
    "phase-type": "PhaseType",
    "asset-token-symbol": "AssetTokenSymbol",
    "type-currency": "TypeCurrency",
  };

  execute(): EnumBag {
    return {
      projectStatus: this.toArray(ProjectStatus),
      projectTypes: this.toArray(ProjectTypes),
      phaseProjectTaskStatus: this.toArray(PhaseProjectTaskStatus),
      auditStatus: this.toArray(AuditStatus),
      evidenceStatus: this.toArray(EvidenceStatus),
      phaseProjectStatus: this.toArray(PhaseProjectStatus),
      phaseType: this.toArray(PhaseType),
      assetTokenSymbol: this.toArray(AssetTokenSymbol),
      typeCurrency: this.toArray(TypeCurrency),
    };
  }

  getOne(name: string): EnumItem[] | null {
    const all = this.execute();
    const resolved = all[name] ?? all[this.aliases[name]];
    return resolved ?? null;
  }

  private toArray<T extends Record<string, string | number>>(e: T): EnumItem[] {
    return Object.entries(e).map(([key, value]) => ({ key, value }));
  }
}
