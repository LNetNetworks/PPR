import { ProjectStatus } from "./project-status.enum";
import { ensureValidProjectDates } from "./project.rules";
import { ProjectTypes } from "./project-types.enum";
import { ProjectPaises } from "./project-paises.enum";
import { AssetTokenSymbol } from "./project-asset-token.enum";
import { TypeCurrency } from "./project-type-currency.enum";

export class Project {
  constructor(
    public readonly id_project: string,
    public type_project: ProjectTypes,
    public date_start: Date,
    public name_project: string,
    public id_organization: string,
    public country_region: ProjectPaises = ProjectPaises.REGIONAL,
    public status: ProjectStatus = ProjectStatus.PENDING,
    public date_end: Date,
    public description?: string,
    public total_contributed_amount?: number,
    public wallet_provider?: string,
    public wallet_token?: string,
    public wallet_index_token?: string,
    public asset_token: AssetTokenSymbol = AssetTokenSymbol.USDC,
    public type_currency: TypeCurrency = TypeCurrency.USD,
  ) {
    ensureValidProjectDates(date_start, date_end);
  }
}
