import { Injectable } from "@nestjs/common";
import { AuthGuard as KeycloakAuthGuard } from "nest-keycloak-connect";

@Injectable()
export class KeycloakJwtAuthGuard extends KeycloakAuthGuard {}
