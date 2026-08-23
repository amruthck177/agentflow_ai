# Agentflow_AI — Agentic AI Automation Platform

> Describe an automation in plain English → watch it materialize as a visual workflow graph → execute it through a chain of cooperating AI agents — all in real time.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Folder Structure](#folder-structure)
5. [Environment Variables](#environment-variables)
   - [Server `.env`](#server-env)
   - [Client `.env.local`](#client-envlocal)
6. [Local Setup — Step by Step](#local-setup--step-by-step)
   - [1. Clone the Repository](#1-clone-the-repository)
   - [2. Install Dependencies](#2-install-dependencies)
   - [3. Configure Environment Variables](#3-configure-environment-variables)
   - [4. Start MongoDB](#4-start-mongodb)
   - [5. Start Redis (Optional but Recommended)](#5-start-redis-optional-but-recommended)
   - [6. Run the Backend Server](#6-run-the-backend-server)
   - [7. Run the Frontend Client](#7-run-the-frontend-client)
   - [8. Open the App](#8-open-the-app)
7. [Running Both Services Concurrently](#running-both-services-concurrently)
8. [OAuth & Third-Party Integrations Setup](#oauth--third-party-integrations-setup)
   - [Gmail (Google OAuth)](#gmail-google-oauth)
   - [Slack](#slack)
   - [Discord](#discord)
   - [Google Sheets](#google-sheets)
9. [AI Provider Setup](#ai-provider-setup)
   - [OpenRouter](#openrouter)
   - [Google Gemini](#google-gemini)
10. [Development Phases](#development-phases)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Security Notes](#security-notes)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Agentflow_AI** is a full-stack AI Operations Automation Platform. It lets operators:

- Describe an automation in **natural language** and have it converted into an **executable visual workflow graph**
- Edit that graph on a **drag-and-drop canvas** (powered by React Flow)
- **Execute** workflows through a chain of cooperating AI agents (Planner → Executor → Validator → Recovery → Monitoring)
- Connect real **third-party tools** (Gmail, Slack, Discord, Google Sheets) via OAuth
- Watch every agent event **stream live** to the browser via Socket.IO
- Audit a **full timeline** of every execution step in MongoDB

The experience aims to feel like a modern operations console — similar in spirit to n8n or Zapier, but with an explicit agentic execution layer on top.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (`@xyflow/react`), Socket.IO client, lucide-react |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, BullMQ on Redis (`ioredis`), Socket.IO, helmet, morgan, compression, express-validator, bcryptjs |
| **AI** | OpenRouter API (primary), Google Generative AI / Gemini (fallback), LangChain, LangGraph |
| **Integrations** | Gmail, Slack, Discord, Google Sheets (OAuth 2.0) |
| **Queue** | BullMQ + Redis (in-memory fallback when Redis is unavailable) |
| **Database** | MongoDB (in-memory fallback for local dev when MongoDB is unavailable) |

---

## Prerequisites

Make sure the following are installed on your machine **before** starting:

| Tool | Minimum Version | Install Link |
|---|---|---|
| **Node.js** | `v18.x` or higher | https://nodejs.org |
| **npm** | `v9.x` or higher (comes with Node) | — |
| **MongoDB** | `v6.x` or higher | https://www.mongodb.com/try/download/community |
| **Redis** | `v7.x` or higher *(optional, but required for BullMQ queues)* | https://redis.io/download |
| **Git** | Any recent version | https://git-scm.com |

> **Note:** If MongoDB or Redis are not available locally, the app ships with in-memory fallbacks so you can still run and test without them.

---

## Folder Structure

```
agentflow-ai/
├── client/                  # Next.js frontend
│   └── src/
│       ├── components/
│       │   ├── AppShell/
│       │   ├── MetricGrid/
│       │   ├── NodePalette/
│       │   ├── NodeConfigPanel/
│       │   ├── WorkflowCanvas/
│       │   └── ProtectedRoute/
│       ├── pages/
│       │   ├── _app.js
│       │   ├── index.js
│       │   ├── login.js
│       │   ├── register.js
│       │   ├── dashboard.js
│       │   ├── integrations.js
│       │   ├── settings.js
│       │   ├── executions/
│       │   │   ├── index.js
│       │   │   └── [id].js
│       │   └── workflows/
│       │       ├── index.js
│       │       ├── builder.js
│       │       └── [id].js
│       ├── store/
│       │   ├── authStore.js
│       │   └── workflowStore.js
│       └── services/
│           ├── api.js
│           └── socket.js
│
└── server/                  # Express backend
    └── src/
        ├── config/
        │   ├── env.js
        │   ├── db.js
        │   └── socket.js
        ├── routes/
        ├── controllers/
        ├── services/
        ├── agents/
        │   ├── orchestrator.js
        │   ├── plannerAgent.js
        │   ├── executionAgent.js
        │   ├── validationAgent.js
        │   ├── recoveryAgent.js
        │   └── monitoringAgent.js
        ├── integrations/
        │   ├── baseIntegration.js
        │   ├── gmailIntegration.js
        │   ├── slackIntegration.js
        │   ├── discordIntegration.js
        │   └── googleSheetsIntegration.js
        ├── models/
        │   ├── User.js
        │   ├── Workflow.js
        │   ├── Execution.js
        │   ├── ExecutionLog.js
        │   ├── Integration.js
        │   └── Notification.js
        └── queues/
            └── executionQueue.js
```

---

## Environment Variables

### Server `.env`

Create a file at `server/.env` and populate it with the values below.

```env
# ─── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB ──────────────────────────────────────────────
# Leave blank or omit to use the in-memory fallback
MONGODB_URI=mongodb://localhost:27017/agentflow_ai

# ─── JWT ──────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# ─── Redis (BullMQ) ───────────────────────────────────────
# Leave blank to use the in-memory queue fallback
REDIS_URL=redis://localhost:6379

# ─── Credential Encryption ────────────────────────────────
# 32-byte hex key for AES-256 encryption of OAuth tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CREDENTIAL_ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here

# ─── CORS ─────────────────────────────────────────────────
CLIENT_URL=http://localhost:3000

# ─── AI Providers (at least one recommended) ──────────────
OPENROUTER_API_KEY=          # Primary AI provider
GEMINI_API_KEY=              # Fallback AI provider
# If both are blank, a deterministic rule-based builder is used

# ─── OAuth: Gmail & Google Sheets ─────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/gmail/callback

# ─── OAuth: Slack ─────────────────────────────────────────
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

# ─── OAuth: Discord ───────────────────────────────────────
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback
```

> **Important:** Never commit the `.env` file to version control. Add it to `.gitignore`.

---

### Client `.env.local`

Create a file at `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Local Setup — Step by Step

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/agentflow-ai.git
cd agentflow-ai
```

---

### 2. Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd ../client
npm install
```

---

### 3. Configure Environment Variables

Copy the example files and fill in your values:

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.local.example client/.env.local
```

Edit both files with your actual keys (see the [Environment Variables](#environment-variables) section above).

To generate secure keys on the fly, run:

```bash
# JWT_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# CREDENTIAL_ENCRYPTION_KEY (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4. Start MongoDB

**Option A — Local MongoDB (Community Edition):**

```bash
# macOS / Linux
mongod --dbpath /usr/local/var/mongodb

# Windows (run in an elevated terminal)
mongod --dbpath "C:\data\db"
```

**Option B — MongoDB Atlas (Cloud):**

1. Create a free cluster at https://cloud.mongodb.com
2. Whitelist your IP address
3. Copy your connection string into `MONGODB_URI` in `server/.env`

**Option C — In-Memory Fallback:**

Leave `MONGODB_URI` blank. The server will automatically use an in-memory MongoDB instance (data is lost on restart).

---

### 5. Start Redis (Optional but Recommended)

Redis is required for **BullMQ background queues and retry scheduling**. If omitted, an in-memory fallback is used.

```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows — use Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

Verify Redis is running:

```bash
redis-cli ping
# Expected output: PONG
```

---

### 6. Run the Backend Server

```bash
cd server
npm run dev
```

The server starts on **http://localhost:5000**

You should see output similar to:

```
✅ MongoDB connected
✅ Redis connected
🚀 Agentflow_AI server running on port 5000
```

If MongoDB or Redis are unavailable, fallback messages will appear instead — the server still starts.

---

### 7. Run the Frontend Client

Open a **new terminal window**:

```bash
cd client
npm run dev
```

The Next.js app starts on **http://localhost:3000**

---

### 8. Open the App

Navigate to **http://localhost:3000** in your browser.

- **Unauthenticated users** are redirected to `/login`
- **Authenticated users** are redirected to `/dashboard`

Register a new account at `/register` to get started.

---

## Running Both Services Concurrently

You can run both the client and server from the root folder using [`concurrently`](https://www.npmjs.com/package/concurrently).

**Install concurrently at the root (one-time setup):**

```bash
# From the project root
npm init -y
npm install concurrently --save-dev
```

Add a root-level `package.json` script:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\""
  }
}
```

Then start everything with:

```bash
npm run dev
```

---

## OAuth & Third-Party Integrations Setup

Integration credentials are **optional** for local dev. The app will flag missing credentials as `INTEGRATION_NOT_CONNECTED` errors in the execution timeline — not silent failures.

### Gmail (Google OAuth)

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Set **Application type** to `Web application`
5. Add `http://localhost:5000/api/integrations/oauth/gmail/callback` as an **Authorized redirect URI**
6. Enable the **Gmail API** and **Google Sheets API** under **APIs & Services → Library**
7. Copy `Client ID` and `Client Secret` into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

---

### Slack

1. Go to https://api.slack.com/apps and click **Create New App → From scratch**
2. Under **OAuth & Permissions**, add the redirect URL:
   `http://localhost:5000/api/integrations/oauth/slack/callback`
3. Add the required bot scopes: `chat:write`, `channels:read`, `incoming-webhook`
4. Navigate to **Basic Information** to copy your **Client ID** and **Client Secret**:
   ```env
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   ```

---

### Discord

1. Go to https://discord.com/developers/applications and click **New Application**
2. Under **OAuth2 → Redirects**, add:
   `http://localhost:5000/api/integrations/oauth/discord/callback`
3. Select the `bot` and `applications.commands` scopes
4. Under **Bot**, copy the **Bot Token**
5. Copy credentials into `server/.env`:
   ```env
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ```

---

### Google Sheets

Google Sheets uses the same OAuth credentials as Gmail. Ensure both the **Gmail API** and **Google Sheets API** are enabled in your Google Cloud project and the scopes include `https://www.googleapis.com/auth/spreadsheets`.

---

## AI Provider Setup

### OpenRouter

1. Sign up at https://openrouter.ai
2. Generate an API key from your dashboard
3. Add it to `server/.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-...
   ```

> OpenRouter is the **primary** AI provider. When set, it powers the prompt-to-workflow generation feature.

---

### Google Gemini

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to `server/.env`:
   ```env
   GEMINI_API_KEY=AIza...
   ```

> Gemini is the **fallback** provider. If `OPENROUTER_API_KEY` is not set, Gemini is used. If neither is set, a **deterministic rule-based builder** is used — it still produces valid graphs for common prompts (send email, invoice routing, Slack/Discord notification, sheet append).

---

## Development Phases

The platform is built in six sequential phases:

| Phase | Focus |
|---|---|
| **1** | Project setup — Next.js, Express, MongoDB (+ in-memory fallback), JWT auth, Zustand store, AppShell layout |
| **2** | Workflow CRUD, React Flow canvas, node palette, configuration panel, metadata persistence |
| **3** | AI prompt-to-workflow generation (OpenRouter → Gemini → deterministic fallback) |
| **4** | Multi-agent orchestration (Planner → Executor → Validator → Recovery → Monitoring) + execution lifecycle (pause, resume, cancel) |
| **5** | Third-party OAuth integrations (Gmail, Slack, Discord, Google Sheets) with credential encryption |
| **6** | BullMQ background queues, Socket.IO real-time streaming, live execution timeline, notification drawer |

---

## API Endpoints Reference

### Health & Auth

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System heartbeat and status check |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Fetch current user profile |

### Workflows

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workflows/dashboard` | Aggregated workflow and execution stats |
| `GET` | `/api/workflows` | List user workflows (paginated/filtered) |
| `POST` | `/api/workflows` | Create a new workflow manually |
| `POST` | `/api/workflows/generate` | Generate workflow from natural-language prompt |
| `GET` | `/api/workflows/:id` | Fetch single workflow details |
| `PUT` | `/api/workflows/:id` | Update existing workflow |
| `POST` | `/api/workflows/:id/duplicate` | Clone an existing workflow |
| `POST` | `/api/workflows/:id/execute` | Trigger an execution run |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |

### Executions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/executions` | List all execution runs |
| `GET` | `/api/executions/:id` | Fetch execution details and snapshot |
| `GET` | `/api/executions/:id/timeline` | Fetch detailed agent timeline logs |
| `POST` | `/api/executions/:id/pause` | Pause an active run |
| `POST` | `/api/executions/:id/resume` | Resume a paused run |
| `POST` | `/api/executions/:id/cancel` | Cancel a running execution |

### Integrations & Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/integrations` | List all user integration connections |
| `GET` | `/api/integrations/status` | Provider health and token validity checks |
| `GET` | `/api/integrations/oauth/:provider/start` | Initiate OAuth flow |
| `GET` | `/api/integrations/oauth/:provider/callback` | Handle OAuth callback |
| `POST` | `/api/integrations` | Manual integration credential setup |
| `GET` | `/api/notifications` | List user notifications |

---

## Security Notes

- Passwords are hashed with **bcrypt** at cost factor 12
- JWTs are signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN`
- OAuth tokens (access + refresh) are **AES-256 encrypted at rest** using `CREDENTIAL_ENCRYPTION_KEY`
- HTTP security headers are set via **helmet**
- CORS is restricted to `CLIENT_URL`
- Auth endpoints are **rate-limited** via `express-rate-limit`
- All request bodies are validated with **express-validator**
- Decrypted tokens are **never logged**
- Missing or expired credentials surface as explicit `INTEGRATION_NOT_CONNECTED` / `AUTH_EXPIRED` errors — never silent 500s

---

## Troubleshooting

### `MongoDB connection failed`
- Make sure `mongod` is running and `MONGODB_URI` is correct.
- Or leave `MONGODB_URI` blank to use the in-memory fallback.

### `Redis connection refused`
- Start Redis (`redis-server`) or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`
- Or leave `REDIS_URL` blank to use the in-memory queue fallback.

### `Cannot find module '@xyflow/react'`
- Run `npm install` inside the `client/` directory.

### `JWT_SECRET is not defined`
- Make sure `server/.env` exists and contains a valid `JWT_SECRET`.

### `Workflow generation returns no nodes`
- Set either `OPENROUTER_API_KEY` or `GEMINI_API_KEY` in `server/.env`.
- Without either, the deterministic rule-based builder is used for common prompts only.

### `OAuth redirect_uri_mismatch`
- Ensure the redirect URI registered in your OAuth provider dashboard **exactly matches** the one in `server/.env` (including `http://` vs `https://` and the port).

### `Socket.IO not receiving events`
- Make sure `NEXT_PUBLIC_SOCKET_URL` points to the correct backend URL.
- Check that no firewall or proxy is blocking WebSocket connections on port 5000.

---

> Built with Next.js, Express, LangGraph, React Flow, and BullMQ.
