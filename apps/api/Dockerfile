FROM oven/bun:1.0 as base

WORKDIR /app

COPY package.json turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bun", "run", "dev"]
