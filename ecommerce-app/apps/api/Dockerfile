# Multi-stage build for API server
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.6

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files from workspaces
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/
COPY tools/*/package.json ./tools/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build stage
FROM base AS builder
WORKDIR /app

# Build the API
RUN pnpm run build --filter=@ecommerce/api

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.6

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./
COPY --from=builder --chown=apiuser:nodejs /app/pnpm-lock.yaml ./
COPY --from=builder --chown=apiuser:nodejs /app/pnpm-workspace.yaml ./

# Copy packages (including database and types)
COPY --from=builder --chown=apiuser:nodejs /app/packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client in production
RUN pnpm db:generate

USER apiuser

EXPOSE 3001

ENV NODE_ENV production

# Start the API server
CMD ["pnpm", "--filter", "@ecommerce/api", "start"]