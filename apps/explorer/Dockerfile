FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune @litedag/explorer --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@litedag/explorer

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=1001:1001 /app/apps/explorer/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/apps/explorer/.next/static ./apps/explorer/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/explorer/server.js"]
