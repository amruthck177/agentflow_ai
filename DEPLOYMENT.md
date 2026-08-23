# Agentflow_AI — Production Deployment Guide

This guide walks you through deploying **Agentflow_AI** to production across cloud providers (Vercel, Render, Railway, Docker, or self-hosted VPS).

---

## 🏗️ Production Architecture

```
                                  ┌───────────────────────────────┐
                                  │      Client (Next.js 15)      │
                                  │   Hosted on Vercel / Render   │
                                  │   https://app.yourdomain.com  │
                                  └───────────────┬───────────────┘
                                                  │
                                   HTTPS / WSS    │ REST & Socket.IO
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │     Backend API & Engine      │
                                  │   Node.js / Express Server    │
                                  │   Hosted on Render / Railway  │
                                  │   https://api.yourdomain.com  │
                                  └───────┬───────────────┬───────┘
                                          │               │
                     Mongoose / TLS       │               │ Redis Protocol
                                          ▼               ▼
                       ┌────────────────────┐   ┌────────────────────┐
                       │   MongoDB Atlas    │   │ Upstash / Redis    │
                       │   Managed Cluster  │   │ BullMQ Work Queues │
                       └────────────────────┘   └────────────────────┘
```

---

## 📋 Environment Variables Matrix

### 1. Backend Server (`server/`)

| Variable | Description | Example / Format |
|---|---|---|
| `PORT` | Listening port on production host | `5000` (Render/Railway sets automatically) |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas cluster connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/agentflow_ai?retryWrites=true&w=majority` |
| `JWT_SECRET` | 64-byte random hex string for signing JWTs | Generated via `crypto.randomBytes(64).toString('hex')` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CREDENTIAL_ENCRYPTION_KEY` | 32-byte hex key for encrypting OAuth tokens at rest | `01234567890123456789012345678901` |
| `CLIENT_URL` | Production URL of your Next.js frontend | `https://app.yourdomain.com` |
| `REDIS_URL` | Production Redis instance URI (Upstash or Redis Cloud) | `rediss://default:pass@endpoint.upstash.io:6379` |
| `OPENROUTER_API_KEY` | *(Optional)* OpenRouter API key | `sk-or-v1-...` |
| `GEMINI_API_KEY` | *(Optional)* Google AI Studio Gemini API key | `AQ.Ab8RN...` |
| `GOOGLE_CLIENT_ID` | *(Optional)* Google OAuth Client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| *(Optional)* Google OAuth Client Secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | Production OAuth Callback for Gmail / Sheets | `https://api.yourdomain.com/api/integrations/oauth/gmail/callback` |
| `SLACK_CLIENT_ID` | *(Optional)* Slack App Client ID | `1234.5678` |
| `SLACK_CLIENT_SECRET` | *(Optional)* Slack App Client Secret | `...` |
| `SLACK_REDIRECT_URI` | Production Slack OAuth Callback | `https://api.yourdomain.com/api/integrations/oauth/slack/callback` |
| `DISCORD_CLIENT_ID` | *(Optional)* Discord Application Client ID | `123456789` |
| `DISCORD_CLIENT_SECRET`| *(Optional)* Discord Application Client Secret | `...` |
| `DISCORD_BOT_TOKEN` | *(Optional)* Discord Bot Token | `Bot token string` |
| `DISCORD_REDIRECT_URI` | Production Discord OAuth Callback | `https://api.yourdomain.com/api/integrations/oauth/discord/callback` |

---

### 2. Frontend Client (`client/`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public URL to backend REST API | `https://api.yourdomain.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Public URL for Socket.IO WebSockets | `https://api.yourdomain.com` |

---

## 🚀 Deployment Option A: Vercel (Frontend) + Render (Backend)

*(Recommended for fastest setup, zero-downtime deploys, and automatic SSL)*

### 1. Deploy the Backend to Render
1. Go to **[render.com](https://dashboard.render.com)** and click **New + Web Service**.
2. Connect your GitHub repository (`amruthck177/agentflow_ai`).
3. Set the build and start settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `node index.js`
4. Add the Environment Variables listed in the table above:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CREDENTIAL_ENCRYPTION_KEY`
   - `CLIENT_URL` (Set this after creating your Vercel frontend)
   - `GEMINI_API_KEY`
5. Click **Create Web Service**. Render will deploy your API to `https://agentflow-ai-backend.onrender.com`.

---

### 2. Deploy the Frontend to Vercel
1. Go to **[vercel.com](https://vercel.com)** and click **Add New Project**.
2. Select your repository (`agentflow_ai`).
3. Set the Project Configuration:
   - **Root Directory**: Select `client`
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://agentflow-ai-backend.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://agentflow-ai-backend.onrender.com`
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g. `https://agentflow-ai.vercel.app`) and update `CLIENT_URL` in your Render backend settings.

---

## 🐳 Deployment Option B: Docker Compose (VPS / Single Host)

You can run the entire stack on any Linux VPS (Ubuntu, Debian, AWS EC2, DigitalOcean Droplet) using Docker.

### 1. `docker-compose.yml`
Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  # Backend API Service
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGODB_URI=mongodb+srv://amruthck123_db_user:YOUR_PASSWORD@amruthck.tcr5spf.mongodb.net/agentflow_ai?retryWrites=true&w=majority
      - JWT_SECRET=your_super_secret_jwt_key_here
      - CREDENTIAL_ENCRYPTION_KEY=01234567890123456789012345678901
      - CLIENT_URL=http://your-domain.com
      - GEMINI_API_KEY=YOUR_GEMINI_KEY

  # Frontend Next.js Client
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://your-domain.com:5000/api
      - NEXT_PUBLIC_SOCKET_URL=http://your-domain.com:5000
    depends_on:
      - server
```

### 2. Run with Docker Compose
```bash
docker compose up -d --build
```

---

## 🔒 Production Security Checklist

- [ ] **MongoDB Atlas IP Access**: Restrict MongoDB Atlas Network Access to your production server IP addresses instead of `0.0.0.0/0`.
- [ ] **JWT Secrets**: Generate a 64-character random cryptographic secret for `JWT_SECRET`.
- [ ] **AES Encryption Key**: Ensure `CREDENTIAL_ENCRYPTION_KEY` is a secret 32-byte key stored securely in environment variables.
- [ ] **HTTPS / SSL**: Ensure both Frontend and Backend are served over HTTPS so WebSocket transports upgrade to secure `wss://`.
- [ ] **CORS Configuration**: Ensure `CLIENT_URL` in the backend matches the exact origin of your frontend domain.

---

## 🩺 Verification & Health Checks

Verify your production deployment:

1. **Heartbeat Healthcheck**:
   ```bash
   curl -I https://api.yourdomain.com/api/health
   # Returns HTTP 200 OK with { "status": "ok", "services": { "mongodb": "connected" } }
   ```

2. **WebSocket Handshake**:
   Check browser console on the dashboard:
   ```
   ⚡ Socket.IO connected: <socket_id>
   ```

3. **Multi-Agent Pipeline Run**:
   Trigger any workflow and verify timeline events stream live in the UI.
