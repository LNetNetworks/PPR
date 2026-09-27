# Toolkit PPR (Pagos por resultado)

## Introduction

This document presents a comprehensive overview of the activities, methodologies, and key results associated with the Toolkit. Its purpose is to detail the architecture, components, and their relationships, as well as the installation, configuration, and implementation procedures for a results-based traceability and payment project using the existing toolkit, secure authentication mechanisms, blockchain traceability, and payments via tokens and stablecoins.

---

## Content

1. [General Architecture Diagram](#1-general-architecture)
2. [Database](#2-database) 
3. [SSO (Authentication)](#3-sso-authentication)
4. [Backend (API)](#4-backend-api)
5. [Frontend](#5-frontend)


---

## 1. General Architecture

![Arquitectura](./img/arquitectura.png)

### Main Components

This diagram describes the four main components for running the PPR application and their relationships.

---

## 2. Database
https://github.com/mongodb/mongo

### MongoDB Quick Install Guide

#### Run MongoDB Container

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:latest
```

---

## 3. SSO (Authentication)

### Keycloak Setup
https://github.com/keycloak/keycloak

The application requires a properly configured Keycloak server for authentication. Below is the required setup.

### Realm Configuration

- Create a new realm named `ppr-realm`
- Configure the realm settings:
  - Enable user registration if needed
  - Set session timeouts as required

### Client Configuration

Create a client for the backend API:

| Setting | Value |
|---|---|
| Client ID | `ppr-api-client` |
| Client Protocol | `openid-connect` |
| Access Type | `confidential` |
| Standard Flow Enabled | ON |
| Direct Access Grants | ON |
| Service Accounts | ON (if using machine-to-machine auth) |

**Valid Redirect URIs**

```
http://localhost:3000/*
https://your-production-domain.com/*
```

### Roles

Create the following realm roles:

| Role | Description |
|---|---|
| `Sponsor` | Can create and fund projects |
| `Provider` | Can deliver services and upload evidence |
| `User` | Can view and participate in projects |
| `Verifier` | Can audit evidence and approve phases |

### Obtaining the Realm Public Key

1. Go to **Realm Settings → Keys**
2. Click on the **Public key** button for the RSA key
3. Copy the key and add it to your `.env`:

```env
KEYCLOAK_REALM_PUBLIC_KEY="<realm-pk>"
```

### Environment Variables

```env
KEYCLOAK_AUTH_SERVER_URL="https://your-keycloak.example.com"
KEYCLOAK_REALM="ppr-realm"
KEYCLOAK_CLIENT_ID="ppr-api-client"
KEYCLOAK_SECRET="<your-client-secret>"
KEYCLOAK_REALM_PUBLIC_KEY="<your-realm-public-key>"
```

> **Note:** The backend uses `nest-keycloak-connect` for JWT validation. All API endpoints (except `/health`) require a valid Bearer token.

---

## 4. Backend (API)

The backend is the core of the PPR platform. It is an API built with NestJS that holds the business logic: it manages projects and their phases, funding contributions, evidence upload and verification, and the transaction log. It connects to the MongoDB database, validates user authentication through Keycloak, and integrates with blockchain to anchor evidence and provide transparency and traceability for results-based payments.

The source code, along with installation, configuration, and usage documentation, is available in its own repository:

**Repository:** https://github.com/LNetNetworks/ppr-backend

---

## 5. Frontend

The frontend is the web interface through which users interact with the PPR platform. It is built with Next.js and provides role-based dashboards (Sponsor, Provider, User, and Verifier) where users can create and fund projects, upload and audit evidence, and track phases and contributions. It communicates with the backend through its API and uses Keycloak for login.

The source code, along with installation, configuration, and usage documentation, is available in its own repository:

**Repository:** https://github.com/LNetNetworks/ppr-frontend
