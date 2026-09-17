import { FetchRequest } from "ethers";
import { KeycloakAuthTokenService } from "./auth/keycloak-auth-token.service";

export function configureEthersAuthInterceptor(
  tokenService: KeycloakAuthTokenService,
) {
  const originalSend = FetchRequest.prototype.send;

  if ((FetchRequest.prototype as any)._pprAuthPatched) {
    return;
  }

  (FetchRequest.prototype as any)._pprAuthPatched = true;

  FetchRequest.prototype.send = async function (...args: any[]) {
    const accessToken = await tokenService.getToken();
    this.setHeader("Authorization", `Bearer ${accessToken}`);

    return originalSend.apply(this, args);
  };
}
