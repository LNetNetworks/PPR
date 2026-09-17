import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class KeycloakAuthTokenService {
  private token: string | null = null;
  private tokenExpiresAt: number | null = null; // timestamp en ms

  constructor(private readonly config: ConfigService) {}

  private get keycloakUrl(): string {
    return this.config.getOrThrow<string>("blockchain.zk_keycloak_token_url");
  }

  private get prividiumUrl(): string {
    return this.config.getOrThrow<string>(
      "blockchain.zk_permission_service_url",
    );
  }

  async getToken(): Promise<string> {
    const now = Date.now();

    if (
      this.token &&
      this.tokenExpiresAt &&
      now < this.tokenExpiresAt - 30_000
    ) {
      return this.token;
    }

    const clientId = this.config.getOrThrow<string>(
      "blockchain.zk_keycloak_client_id",
    );
    const clientSecret = this.config.getOrThrow<string>(
      "blockchain.zk_keycloak_client_secret",
    );
    const username = this.config.getOrThrow<string>(
      "blockchain.zk_keycloak_username",
    );
    const password = this.config.getOrThrow<string>(
      "blockchain.zk_keycloak_password",
    );

    const body = new URLSearchParams({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
      scope: "openid email profile",
    });

    const resKeycloak = await axios.post(this.keycloakUrl, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ppr-backend-blockchain-client",
      },
    });

    const { id_token, expires_in } = resKeycloak.data;
    if (!id_token) {
      throw new BadRequestException("Keycloak no devolvió id_token");
    }

    const r2 = await axios.post(
      this.prividiumUrl,
      { jwt: id_token },
      { headers: { "content-type": "application/json" } },
    );

    const privToken: string = r2.data.token;
    if (!privToken) {
      throw new BadRequestException("Prividium no devolvió token");
    }

    const ttl = (expires_in ?? 300) * 1000;
    this.token = privToken;
    this.tokenExpiresAt = now + ttl;

    return privToken;
  }
}
