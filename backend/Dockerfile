FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG APP_VERSION=2.5.0
ARG GIT_SHA=local
ARG GIT_REF=local
ARG BUILD_TIME=unknown
ENV APP_VERSION=$APP_VERSION GIT_SHA=$GIT_SHA GIT_REF=$GIT_REF BUILD_TIME=$BUILD_TIME
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ARG APP_VERSION=2.5.0
ARG GIT_SHA=local
ARG GIT_REF=local
ARG BUILD_TIME=unknown
ENV NODE_ENV=production \
    APP_VERSION=$APP_VERSION \
    GIT_SHA=$GIT_SHA \
    GIT_REF=$GIT_REF \
    BUILD_TIME=$BUILD_TIME
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
  && useradd --system --uid 10001 --create-home regintel \
  && chown -R regintel:regintel /app
USER regintel
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
