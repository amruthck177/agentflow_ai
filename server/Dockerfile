# ─── Server Dockerfile ───
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy application source
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
