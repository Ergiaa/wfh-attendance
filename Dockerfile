# syntax=docker/dockerfile:1

# Builds every image from the monorepo root:
#   --target service --build-arg APP=<gateway|employees-service|attendance-service>
#   --target web

FROM node:24-slim AS base
WORKDIR /app

# Only manifests, so dependency layers are reused until a package.json or the lockfile changes.
FROM base AS manifests
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/gateway/package.json apps/gateway/
COPY apps/employees-service/package.json apps/employees-service/
COPY apps/attendance-service/package.json apps/attendance-service/
COPY apps/web/package.json apps/web/

FROM manifests AS build
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.base.json ./
COPY packages packages
COPY apps apps
RUN npm run build:packages \
 && npm run build -w gateway -w employees-service -w attendance-service -w web

FROM manifests AS prod-deps
ARG APP
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --workspace=apps/${APP}

FROM prod-deps AS service
ARG APP
ENV NODE_ENV=production
COPY --from=build /app/packages/contracts/dist packages/contracts/dist
COPY --from=build /app/packages/nest-common/dist packages/nest-common/dist
COPY --from=build /app/apps/${APP}/dist apps/${APP}/dist
# Owned by node so a named volume mounted here (the gateway's photo uploads) is writable.
RUN mkdir -p /data/uploads && chown node:node /data/uploads
WORKDIR /app/apps/${APP}
USER node
CMD ["node", "dist/main.js"]

FROM nginx:1.27-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
