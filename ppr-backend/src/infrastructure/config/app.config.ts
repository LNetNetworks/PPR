export default () => ({
  wallet: {
    derivationNamespace: resolveWalletDerivationNamespace(
      process.env.WALLET_DERIVATION_NAMESPACE,
    ),
  },
  app: {
    port: parseInt(process.env.PORT ?? "3000", 10),
    globalPrefix: process.env.GLOBAL_PREFIX ?? "ppr",
    env: process.env.NODE_ENV ?? "development",
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  },
  db: {
    uri: process.env.MONGODB_URI ?? "",
    name: process.env.MONGODB_DB ?? "",
  },
  keycloak: {
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL ?? "",
    realm: process.env.KEYCLOAK_REALM ?? "",
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
    secret: process.env.KEYCLOAK_SECRET ?? "",
    realmPublicKey: process.env.KEYCLOAK_REALM_PUBLIC_KEY ?? "",
    logLevel: process.env.KEYCLOAK_LOG_LEVEL ?? "warn,debug",
  },
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK,
    url: process.env.RPC_URL ?? "",
    privateKey: process.env.PRIVATE_KEY ?? "",
    gasNodeAddress: process.env.GAS_NODE_ADDRESS ?? "",
    gasExpiration: process.env.GAS_EXPIRATION
      ? Number(process.env.GAS_EXPIRATION)
      : 300_000,
    address_contract: process.env.ADDRESS_CONTRACT,
    address_token: process.env.ADDRESS_TOKEN ?? "",
    address_gas_prividium: process.env.ADDRESS_GAS_PRIVIDIUM ?? "",
    trusted_forwarder: process.env.TRUSTED_FORWARDER,
    zk_keycloak_token_url: process.env.ZK_KEYCLOAK_TOKEN_URL,
    zk_permission_service_url: process.env.ZK_PERMISSION_SERVICE_URL ?? "",
    zk_rpc_node_url: process.env.ZK_RPC_NODE_URL ?? "",
    zk_user_private_key: process.env.ZK_USER_PRIVATE_KEY ?? "",
    zk_keycloak_client_id: process.env.ZK_KEYCLOAK_CLIENT_ID ?? "",
    zk_keycloak_client_secret: process.env.ZK_KEYCLOAK_CLIENT_SECRET ?? "",
    zk_keycloak_username: process.env.ZK_KEYCLOAK_USERNAME ?? "",
    zk_keycloak_password: process.env.ZK_KEYCLOAK_PASSWORD ?? "",
    address_token_usdc: process.env.ADDRESS_TOKEN_USDC ?? "",
    gponsor_transfer_contract: process.env.GSPONSOR_TRANSFER_CONTRACT ?? "",
    gsponsor_seed: process.env.GSPONSOR_SEED,
  },
  metrics: {
    token: process.env.METRICS_TOKEN,
  },
  storage: {
    apiUrl: process.env.FILE_STORE_API_URL ?? "",
    apiKey: process.env.FILE_STORE_API_KEY ?? "",
  },
  logging: {
    level: process.env.NEST_LOG_LEVEL ?? "log,error,warn",
  },
  pok: {
    url: process.env.POK_API_URL ?? "",
    apikey: process.env.POK_APIKEY ?? "",
  },
  bridge: {
    url: process.env.BRIDGE_API_URL ?? "",
    apiKey: process.env.BRIDGE_API_KEY ?? "",
    timeoutMs: process.env.BRIDGE_TIMEOUT_MS
      ? Number(process.env.BRIDGE_TIMEOUT_MS)
      : 60_000,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
  },
  mail: {
    from: process.env.MAIL_FROM ?? "",
  },
});

/**
 * Turns the comma-separated origin list into an array, dropping surrounding
 * whitespace and empty entries so that a trailing comma or a space after the
 * separator does not produce spurious origins.
 */
export function parseCorsOrigins(rawValue?: string): string[] {
  return (rawValue ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function resolveWalletDerivationNamespace(rawValue?: string): number {
  const value = (rawValue ?? "").trim().toLowerCase();

  if (!value) {
    return 0;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const namespaceMap: Record<string, number> = {
    local: 1,
    dev: 1,
    stage: 2,
    prod: 3,
    production: 3,
  };

  const resolved = namespaceMap[value];
  if (resolved !== undefined) {
    return resolved;
  }

  throw new Error(
    `Invalid WALLET_DERIVATION_NAMESPACE value: "${rawValue}". Use a numeric value or one of: local, dev, stage, prod, production.`,
  );
}
