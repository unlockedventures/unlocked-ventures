# syntax=docker/dockerfile:1.7
# Deploy packaging (with docker-compose.yml + .github/workflows). Not used by pnpm
# day-to-day coding. Operator runbook: README.DOCKER.md.
#
# Production app: multi-stage build → distroless Node runtime (no shell, no package manager).
# Fixed non-root UID/GID (default 10001). Secrets never baked into the image.
#
# Distroless has no /bin/sh; boot uses scripts/docker-app-entrypoint.mjs.
# Build on Debian (glibc) so sharp/native deps match distroless.

ARG NODE_VERSION=22
ARG APP_UID=10001
ARG APP_GID=10001

# --- deps ---
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.6 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- build ---
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.6 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Build-time placeholders; runtime secrets come from Compose/CI (.env).
# No Postgres during image build — use Next compile + generate-env (Payload docs).
ENV PAYLOAD_SECRET=build-time-placeholder-not-used-at-runtime
ENV DATABASE_URL=postgresql://payload:payload@127.0.0.1:5432/unlocked_ventures
ENV NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:3000
# typescript.ignoreBuildErrors in next.config.ts; build script skips SSG/DB connect.
RUN pnpm build \
  # pnpm stores sharp as a symlink under .pnpm (no top-level @img). Materialize real dirs.
  && mkdir -p /app/.docker-native/node_modules/@img \
  && SHARP_DIR="$(readlink -f /app/node_modules/sharp)" \
  && test -f "${SHARP_DIR}/package.json" \
  && cp -a "${SHARP_DIR}" /app/.docker-native/node_modules/sharp \
  && PNPM_NM="$(dirname "${SHARP_DIR}")" \
  && if [ -d "${PNPM_NM}/@img" ]; then \
       cp -a "${PNPM_NM}/@img/." /app/.docker-native/node_modules/@img/; \
     fi \
  && if [ -d "${SHARP_DIR}/node_modules/@img" ]; then \
       cp -a "${SHARP_DIR}/node_modules/@img/." /app/.docker-native/node_modules/@img/; \
     fi \
  && touch /app/.docker-native/node_modules/@img/.keep \
  && test -f /app/.docker-native/node_modules/sharp/package.json

# --- identity files for custom UID in distroless ---
FROM debian:bookworm-slim AS users
ARG APP_UID=10001
ARG APP_GID=10001
RUN groupadd --gid "${APP_GID}" app \
  && useradd --uid "${APP_UID}" --gid app --home-dir /app --shell /usr/sbin/nologin --no-create-home app \
  && mkdir -p /app/media /app/tmp \
  && chown -R "${APP_UID}:${APP_GID}" /app

# --- runtime: distroless (no shell, no apt, no package manager) ---
ARG NODE_VERSION=22
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 AS runner
ARG APP_UID=10001
ARG APP_GID=10001

WORKDIR /app

COPY --from=users /etc/passwd /etc/passwd
COPY --from=users /etc/group /etc/group
COPY --from=users --chown=${APP_UID}:${APP_GID} /app/media /app/media
COPY --from=users --chown=${APP_UID}:${APP_GID} /app/tmp /app/tmp

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TMPDIR=/app/tmp

COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/.next/standalone ./
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/.next/static ./.next/static
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/public ./public
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/.docker-native/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/.docker-native/node_modules/@img ./node_modules/@img
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/scripts/ensure-schema.mjs ./scripts/ensure-schema.mjs
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/scripts/ensure-*.sql ./scripts/
COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/scripts/docker-app-entrypoint.mjs ./scripts/docker-app-entrypoint.mjs

USER ${APP_UID}:${APP_GID}
EXPOSE 3000
# Distroless has no shell — healthcheck must use node exec form.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/nodejs/bin/node", "/app/scripts/docker-app-entrypoint.mjs"]
