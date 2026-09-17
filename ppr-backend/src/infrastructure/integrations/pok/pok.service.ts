import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExternalApiClient } from "../../integrations/external-api.client";
import { UserRepository } from "../../../domain/users/user.repository";
import { PokVcResponse } from "../../../application/integrations/pok/use-cases/types";

@Injectable()
export class PokService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly cfg: ConfigService,
    private readonly http: ExternalApiClient,
    private readonly users: UserRepository,
  ) {
    this.baseUrl = (this.cfg.get<string>("pok.url") || "").replace(/\/+$/, "");
    this.apiKey = this.cfg.get<string>("pok.apikey")!;
    if (!this.baseUrl) {
      throw new BadRequestException("POK_URL not configured");
    }
    if (!this.apiKey) {
      throw new BadRequestException("POK_APIKEY not configured");
    }
  }

  async getCredentialsByDate(
    date_start: string,
    date_end: string,
  ): Promise<PokVcResponse> {
    if (!this.apiKey) return { pagination: {}, data: [] } as any;
    if (!this.baseUrl) return { pagination: {}, data: [] } as any;

    const dateStartApi = new Date(date_start).toISOString();
    const dateEndApi = new Date(date_end).toISOString();

    const url = `${this.baseUrl}?fromDate=${encodeURIComponent(dateStartApi)}&toDate=${encodeURIComponent(dateEndApi)}`;

    try {
      const body = await this.http.get<any>(url, {
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
        },
      });

      if (!body || !Array.isArray(body.data)) {
        throw new InternalServerErrorException(
          "POK response invalid: missing data[]",
        );
      }

      return body;
    } catch (err: any) {
      console.error(err);
      throw new InternalServerErrorException("Error calling POK API");
    }
  }

  async detectImageType(buffer: Buffer) {
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return { mime: "image/png", ext: ".png" };
    }

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return { mime: "image/jpeg", ext: ".jpg" };
    }

    if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      return { mime: "image/webp", ext: ".webp" };
    }

    if (
      buffer.length >= 6 &&
      (buffer.toString("ascii", 0, 6) === "GIF87a" ||
        buffer.toString("ascii", 0, 6) === "GIF89a")
    ) {
      return { mime: "image/gif", ext: ".gif" };
    }

    return { mime: "application/octet-stream", ext: "" };
  }

  async downloadDecryptedImage(vcId: string) {
    const baseUrl = (this.cfg.get<string>("pok.url") || "").replace(/\/+$/, "");
    if (!vcId) {
      throw new BadRequestException("The vcId is empty o incorrect");
    }

    const url = `${baseUrl}/${vcId}/decrypted-image`;

    try {
      const pokResponse = await this.http.get(url, {
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
        },
      });
      const location = pokResponse?.location;

      if (!location) {
        throw new InternalServerErrorException(
          "POK API did not return a valid location URL",
        );
      }

      const imgResp: any = await this.http.get(location, {
        responseType: "arraybuffer",
      });

      const raw = imgResp?.data ?? imgResp;
      const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
      const detected = await this.detectImageType(buffer);
      const nodeBuffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);

      return {
        buffer: nodeBuffer,
        contentType: detected.mime,
        extension: detected.ext,
      };
    } catch (err: any) {
      console.error(err);
      throw new InternalServerErrorException(
        "Error calling POK API (decrypted-image)",
      );
    }
  }
}
