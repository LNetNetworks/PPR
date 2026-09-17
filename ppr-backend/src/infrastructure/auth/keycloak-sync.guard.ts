import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserProvisioningService } from "./user-provisioning.service";

@Injectable()
export class KeycloakSyncGuard implements CanActivate {
  constructor(
    private readonly provisioning: UserProvisioningService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userFromToken = req.user;
    if (userFromToken) {
      const appUser =
        await this.provisioning.ensureUserFromKeycloakPayload(userFromToken);
      req.currentUser = appUser;
    }
    return true;
  }
}
