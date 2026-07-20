# When Comp — Dockerfile (used by Render's Docker runtime).
# Multi-stage: install + build, then a lean runtime image.

FROM node:20-slim AS build
WORKDIR /app
# Prisma needs openssl on Debian slim.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Install ALL deps (devDeps needed to build Next).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --include=dev

# Build the app (prisma generate + next build; no DB connection needed).
COPY . .
RUN npm run build

# ---- Runtime image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy the built app and its dependencies.
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/next.config.mjs ./next.config.mjs

# Render injects PORT; Next's `start` respects it.
EXPOSE 3000

# On start: ensure the (Neon) schema exists, then launch.
# `db push` is idempotent and won't drop existing data on later boots.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
