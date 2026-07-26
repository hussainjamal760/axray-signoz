# =======================================================
# AXRAY Server Dockerfile (pnpm Monorepo Multi-Stage)
# =======================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Copy root monorepo configs & workspace definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/server ./apps/server

# Install workspace dependencies
RUN pnpm install

# Compile TypeScript
RUN pnpm --filter server build

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install docker-cli for auto-import & workspace management
RUN apk add --no-cache docker-cli

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/server ./apps/server
COPY deploy ./deploy

# Install production dependencies for workspace
RUN pnpm install --prod

# Copy compiled JavaScript output
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
