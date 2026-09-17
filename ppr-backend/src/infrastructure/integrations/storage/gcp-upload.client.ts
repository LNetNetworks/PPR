import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import FormData from "form-data";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class GcpUploadClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {}

  async uploadLocalFile(
    localPath: string,
    destinationPath: string,
    originalName?: string,
    contentType?: string,
    deleteLocalAfter = false,
  ): Promise<{ uri: string; raw: any }> {
    const apiUrl = this.config.get<string>("storage.apiUrl");
    const apiKey = this.config.get<string>("storage.apiKey");
    if (!apiUrl || !apiKey) {
      throw new BadRequestException(
        `Missing storage config: FILE_STORE_API_URL or FILE_STORE_API_KEY`,
      );
    }

    try {
      new URL(apiUrl);
    } catch {
      throw new BadRequestException(`Invalid FILE_STORE_API_URL: "${apiUrl}"`);
    }

    const form = new FormData();
    const stream = fs.createReadStream(localPath);
    const fileName = originalName ?? path.basename(localPath);
    form.append("file", stream, {
      filename: fileName,
      contentType: contentType,
    });

    if (destinationPath) form.append("path", destinationPath);
    form.append("filename", fileName);
    if (contentType) form.append("contentType", contentType);

    const res = await axios.post(apiUrl, form, {
      headers: { ...form.getHeaders(), "X-API-Key": apiKey },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60_000,
    });

    const uri = res.data.files[0]?.publicUrl;
    if (deleteLocalAfter) {
      fs.unlink(localPath, () => {});
    }
    return { uri, raw: res.data };
  }
}
