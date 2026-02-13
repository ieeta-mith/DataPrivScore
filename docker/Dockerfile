FROM node:20-alpine AS base

ARG BUILD_NPM_TOKEN

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

FROM base AS builder

WORKDIR /frontend
COPY --from=deps /frontend/node_modules ./node_modules
COPY . .

RUN npm run build

FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets to /privacy subdirectory to match the base path
COPY --from=builder /frontend/dist /usr/share/nginx/html/privacy

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]