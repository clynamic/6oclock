FROM node:22-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN yarn install --frozen-lockfile --production=false

FROM base AS build-web
COPY packages/web/ packages/web/
COPY tsconfig.json ./
RUN yarn workspace @6oclock/web build

FROM base AS build-api
COPY packages/api/ packages/api/
COPY tsconfig.json ./
RUN yarn workspace @6oclock/api build

FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/api/package.json packages/api/
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=build-api /app/packages/api/dist packages/api/dist
COPY --from=build-web /app/packages/web/dist packages/api/dist/public
EXPOSE 34571
CMD ["node", "packages/api/dist/main.js"]
