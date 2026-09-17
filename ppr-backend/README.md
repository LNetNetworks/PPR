# PPR Backend Synopsis

PPR Backend is a production-oriented NestJS API that orchestrates project financing, contributions, evidence handling, and blockchain anchoring for the Pago por Resultado (Pay for Result) platform. It follows clean architecture principles with a clear separation between domain entities, application use cases, and infrastructure concerns (HTTP, persistence, auth, integrations). Every controller is wired into a global Keycloak guard stack, Swagger documentation, and a transaction audit trail that persists every meaningful mutation.

## Technology Landscape

| Layer | Technology | Role |
|-------|------------|------|
| Framework | **NestJS 11.x** | Structured modular server with pipes, guards, interceptors, and dependency injection. |
| Language | **TypeScript 5.x** | Strict typing for domain models and DTOs. |
| Database | **MongoDB 8.x via Mongoose** | Schemas, repositories, and sequence service for deterministic identifiers. |
| Auth | **Keycloak 26.x** (via `nest-keycloak-connect`) | OAuth2/OIDC with guards for authentication, resources, and roles. |
| API Docs | **Swagger (OpenAPI) 11.x** | Auto-generated REST contract accessible under `/docs`. |
| Blockchain | **ethers.js 6.x + custom integrations** | Anchoring evidence/transactions on LACChain, supporting relayed txs via a trusted forwarder. |
| Integrations | **Pok API, file storage, Keycloak syncing services** | External services for evidence verification, file storage tiers, and user provisioning. |
| Observability | **Prometheus client (`@willsoto/nestjs-prometheus`)** | Metrics instrumentation exposed automatically for scraper ingestion. |

## Blockchain & Integration Highlights

- **LACChain network**: The stack expects an RPC URL and private key that are used by the `@lacchain/gas-model-provider` and `ethers.js` flows. Transactions reference a deployed smart contract (`ADDRESS_CONTRACT`), and gas sponsorship is supported via a configured forwarder and gas expiration window.
- **Keycloak Sync**: Endpoints like `POST /users/sync` accept bearer tokens, sync local records, and register roles/organizations automatically by querying Keycloak data and writing to MongoDB.
- **Evidence Anchoring**: Evidence upload routes persist metadata to MongoDB and, when configured, anchor proofs on-chain while storing files through the configured file storage service (`FILE_STORE_API_URL`).
- **POK API**: Additional third-party service integration that requires `POK_API_URL` and `POK_APIKEY` for ledger operations.

## Required Environment Variables

Before starting the application you must register the following environment variables (for example in a `.env` file loaded by `@nestjs/config`):

| Variable                    | Description                                | Example |
|----------                   |-------------                               |---------|
| `NODE_ENV`                  | Runtime environment mode                   | `development` |
| `PORT`                      | HTTP port (fallback: `3000`)               | `3000` |
| `GLOBAL_PREFIX`             | API prefix applied to every route          | `ppr` |
| `CORS_ORIGINS`              | Comma-separated browser origins allowed by CORS. No limit on how many; each entry must be scheme + host (+ optional port), with no trailing slash or path | `https://app.example.com,https://stg-app.example.com,http://localhost:5173` |
| `MONGODB_URI`               | Connection string to MongoDB               | `mongodb://user:pass@host:27017/ppr` |
| `MONGODB_DB`                | Database name                              | `ppr` |
| `KEYCLOAK_AUTH_SERVER_URL`  | Base URL of Keycloak server                | `https://auth.example.com` |
| `KEYCLOAK_REALM`            | Keycloak realm                             | `ppr-realm`        |
| `KEYCLOAK_CLIENT_ID`        | Confidential client ID                     | `ppr-api-client` |
| `KEYCLOAK_SECRET`           | Client secret                              | (opaque secret) |
| `KEYCLOAK_REALM_PUBLIC_KEY` | Realm RSA public key                       | `MIIBIjANBgkq...` |
| `KEYCLOAK_LOG_LEVEL`        | Level filters for Keycloak logs             | `warn,debug` |
| `ZK_KEYCLOAK_TOKEN_URL`     | Keycloak token URL for Zero-Knowledge flows| `https://zk-auth.example.com/protocol/openid-connect/token` |
| `ZK_PERMISSION_SERVICE_URL` | Prividium permission service that exchanges the Keycloak id_token for a network token. Optional: only the prividium path uses it | `https://permissions.example.com/token` |
| `ZK_RPC_NODE_URL`           | RPC endpoint for ZK network                | `https://zk-node.example.com` |
| `ZK_USER_PRIVATE_KEY`       | Wallet private key for ZK user             | `0xabc123...` |
| `ZK_KEYCLOAK_CLIENT_ID`     | ZK Keycloak client                         | `ppr-zk-client` |
| `ZK_KEYCLOAK_CLIENT_SECRET` | Secret for ZK client                       | (opaque secret) |
| `ZK_KEYCLOAK_USERNAME`      | Service account username                   | `batch-sync` |
| `ZK_KEYCLOAK_PASSWORD`      | Service account password                   | (opaque secret) |
| `TRUSTED_FORWARDER`         | Gas relayer address. Required: no default  | `0x...` |
| `RPC_URL`                   | Public RPC URL for blockchain interactions | `https://rpc.lacchain.net` |
| `BLOCKCHAIN_NETWORK`        | Name of the blockchain network              | `prividium` |
| `PRIVATE_KEY`               | Wallet used for signing transactions       | `0x0123...` |
| `GAS_NODE_ADDRESS`    | Optional gas sponsor address                     | `0xfeedface...` |
| `GAS_EXPIRATION`      | Expiration window in **milliseconds** for sponsored gas. Defaults to `300000` (5 minutes) | `300000` |
| `ADDRESS_CONTRACT`    | Deployed smart contract address                  | `0xabcdef...` |
| `ADDRESS_TOKEN`       | Deployed token contract address                  | `0xabcdef...` |
| `ADDRESS_TOKEN_USDC`  | USDC token contract address used in payouts     | `0xC5D7fd2c54D86531306d23Eab91e706E4121E542` |
| `ADDRESS_GAS_PRIVIDIUM` | Prividium native gas token contract address    | `0x000000000000000000000000000000000000800A` |
| `GSPONSOR_SEED`       | BIP-39 mnemonic the in-app signer derives every project and sponsor wallet from. Validated at startup, checksum included | (12- or 24-word mnemonic) |
| `GSPONSOR_TRANSFER_CONTRACT` | Contract used for sponsored transfers     | `0xabcdef...` |
| `WALLET_DERIVATION_NAMESPACE` | Namespace used to derive project wallets by environment | `dev` |
| `FILE_STORE_API_URL`  | Endpoint for file storage service                | `https://filestore.example.com/api` |
| `FILE_STORE_API_KEY`  | API key for file storage                         | (opaque key) |
| `POK_API_URL`         | Endpoint for POK integration                     | `https://pok.example.com/api` |
| `POK_APIKEY`          | High-privilege API key                           | (opaque key) |
| `BRIDGE_API_URL`      | Endpoint for the bridge integration              | `https://bridge.example.com/api` |
| `BRIDGE_API_KEY`      | API key for the bridge integration               | (opaque key) |
| `BRIDGE_TIMEOUT_MS`   | Bridge request timeout in milliseconds. Optional: defaults to `60000` | `60000` |
| `RESEND_API_KEY`      | API key for the Resend mail provider             | (opaque key) |
| `MAIL_FROM`           | Sender address used on outgoing mail             | `noreply@example.com` |
| `NEST_LOG_LEVEL`      | Comma-separated Nest log levels                  | `log,error,warn` |
| `METRICS_TOKEN`       | Token used to secure Prometheus metrics          | (16+ characters) |

Variables in bold must be present for secure authentication and blockchain anchoring to work correctly. `GAS_NODE_ADDRESS` and `ZK_PERMISSION_SERVICE_URL` default to an empty value when not set; `GAS_EXPIRATION` defaults to `300000` milliseconds, the five-minute window applied before it became configurable.

## Project Wallet Seeding

The wallet derivation namespace must be set to a short environment value, not to a full command. Each namespace maps to a fixed numeric derivation index:

| Namespace | Derivation index |
|-----------|------------------|
| `local`   | `1` |
| `dev`     | `1` |
| `stage`   | `2` |
| `prod`    | `3` |

Use one of the supported values below and run the matching seed command separately. In Docker/Kubernetes runtime images, `yarn seed:project-wallets` executes the compiled script from `dist/`; `yarn seed:project-wallets:local` is only for local development with `ts-node`.

| Environment | `WALLET_DERIVATION_NAMESPACE` | Seed command |
|-------------|-------------------------------|--------------|
| Local       | `local`                       | `yarn seed:project-wallets:local` |
| Dev         | `dev`                         | `WALLET_DERIVATION_NAMESPACE=dev yarn seed:project-wallets` |
| Stage       | `stage`                       | `WALLET_DERIVATION_NAMESPACE=stage yarn seed:project-wallets` |
| Prod        | `prod`                        | `WALLET_DERIVATION_NAMESPACE=prod yarn seed:project-wallets` |

Run the seeding command once per environment after deployment or after restoring a database so the `project_wallets` counter matches the highest historical wallet index already stored in `projects`.

## Running the Application

```bash
npm install
npm run start:dev
```

The default base URL becomes `http://localhost:3000/${GLOBAL_PREFIX}` (e.g., `http://localhost:3000/ppr`). Swagger documentation is available at `/docs` and the health endpoint lives under `/health`.

## Production Notes

- **Docker**: Build with `docker build -t ppr-backend .` and run `docker run -p 3000:3000 --env-file .env ppr-backend`.
- **CORS**: Configured to allow the registered front-end domains; update `main.ts` when new origins are needed.
- **Observability**: Metrics exported under `/metrics` via `prom-client` and logged using Nest’s logger plus Keycloak debug levels.
- **Audit Trail**: Every route that mutates data attaches a transaction type to `Request` (see `TransactionAuditInterceptor`) so operations are stored in the `transactions` collection with deterministic IDs.

## Summary

PPR Backend is a secure, modular NestJS API that hinges on Keycloak-authenticated REST endpoints, MongoDB persistence, and optional blockchain anchoring through ethers/LACChain. Configure the required environment variables first, then start the NestJS process to unlock project, user, evidence, contribution, and transaction workflows that feed both the application database and the blockchain audit trail.
