# Dockerfile for Foundry Web Application
# Multi-stage build for optimal image size and security

# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
COPY packages/mcp-server/package.json ./packages/mcp-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
COPY packages/mcp-server/package.json ./packages/mcp-server/

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY packages/ui ./packages/ui
COPY packages/config ./packages/config
COPY packages/mcp-server ./packages/mcp-server
COPY turbo.json ./

# Copy Next.js config files from apps/web
COPY apps/web/postcss.config.mjs ./
COPY apps/web/next.config.ts ./
COPY apps/web/next-env.d.ts ./
COPY apps/web/tsconfig.json ./

# Set DATABASE_URL for build (needed for Prisma static generation)
ENV DATABASE_URL="postgresql://foundry:foundry@localhost:5432/foundry?schema=public"

# Generate Prisma client
RUN pnpm db:generate

# Build the application (skip linting for Docker builds)
RUN pnpm --filter @foundry/web build --no-lint

# =============================================================================
# Stage 3: Runner
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 foundry

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json for scripts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Create data directory
RUN mkdir -p /app/data && chown -R foundry:nodejs /app/data

# Switch to non-root user
USER foundry

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start the application
CMD ["node", "apps/web/server.js"]
