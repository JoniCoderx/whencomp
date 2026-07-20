# When Comp — Dockerfile (used by Render's Docker runtime).
# Multi-stage: install + build, then a lean runtime image.

FROM node:22-slim AS build
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
FROM node:22-slim AS runner
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

# Startup is resilient to Neon free-tier cold starts (57P01): db push is retried
# a few times, the roster bootstrap is non-fatal, and `next start` ALWAYS runs
# (`;` not `&&`) so a transient DB hiccup can never block the app from booting.
CMD ["sh", "-c", "for i in 1 2 3 4 5; do npx prisma db push --skip-generate --accept-data-loss && break || (echo 'db push retry '$i'...'; sleep 4); done; node prisma/bootstrap.mjs || echo 'bootstrap skipped'; npm run start"]
