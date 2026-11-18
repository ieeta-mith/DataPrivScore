FROM node:24.22.1-alpine3.23 AS base

ARG BUILD_NPM_TOKEN
ARG VITE_KEYCLOAK_URL
ARG VITE_COMMUNITY_KEY
ARG VITE_STANDALONE_MODE
ARG VITE_SIDEBAR_DEV_MODE

ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_COMMUNITY_KEY=${VITE_COMMUNITY_KEY} \
    VITE_STANDALONE_MODE=${VITE_STANDALONE_MODE} \
    VITE_SIDEBAR_DEV_MODE=${VITE_SIDEBAR_DEV_MODE}

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /frontend

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* seed.sh ./
RUN BUILD_NPM_TOKEN=${BUILD_NPM_TOKEN} ./seed.sh

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]