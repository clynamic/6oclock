FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@^11.10.0
COPY package.json package-lock.json .npmrc ./
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN npm ci

FROM base AS build-web
COPY packages/web/ packages/web/
COPY tsconfig.json ./
RUN npm run build -w @6oclock/web

FROM base AS build-api
COPY packages/api/ packages/api/
COPY tsconfig.json ./
RUN npm run build -w @6oclock/api

FROM node:22-alpine
WORKDIR /app
RUN npm install -g npm@^11.10.0
COPY package.json package-lock.json .npmrc ./
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build-api /app/packages/api/dist packages/api/dist
COPY --from=build-web /app/packages/web/dist packages/api/dist/public
RUN mkdir -p /app/data /data
EXPOSE 34571
CMD ["node", "packages/api/dist/main.js"]
