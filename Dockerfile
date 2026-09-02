# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# Production image for the UNRWLY storefront (Next.js 16 + Prisma 7).
#
# Not used by Vercel — Vercel builds this repo natively and ignores this file.
# This is for self-hosting (VPS, Fly, Railway, ECS, or a client's own server).
#
# Build and run with compose — `docker compose build && docker compose up -d`.
#
# Prefer compose over `docker run --env-file .env`: this project's .env quotes
# its values, and --env-file passes the quotes through literally, so Prisma
# receives a connection string beginning with `"` and cannot resolve the host.
# Compose parses the quotes correctly.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
# Next's standalone server and sharp both want libc compatibility shims on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app


# ── deps ─────────────────────────────────────────────────────────────────────
# prisma/ and prisma.config.ts are copied before install because package.json's
# `postinstall` runs `prisma generate`, which needs the schema and the config.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci


# ── builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `output: 'standalone'` is gated on this flag in next.config.ts so that Vercel
# builds stay exactly as they are today.
ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1

# The build needs real values: every NEXT_PUBLIC_* var is inlined into the
# client bundle at build time, and server components query the database while
# prerendering. The secret mount makes .env readable for this one command only —
# it is never written to an image layer.
RUN --mount=type=secret,id=dotenv,target=/app/.env,required=true \
    npm run build \
 && rm -f .next/standalone/.env .next/standalone/.env.*
# Next copies any .env it finds at build time into the standalone bundle, which
# would put every secret into the final image as a plain file. Deleted in the
# same layer so it never gets committed. Values reach the container at runtime
# through the environment instead.


# ── runner ───────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind to every interface — the default localhost bind is unreachable from
# outside the container.
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public

# The standalone bundle carries its own pruned node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
