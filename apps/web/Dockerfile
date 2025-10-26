FROM oven/bun:1.0 as base

WORKDIR /app

COPY package.json turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/web/package.json ./apps/web/

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["bun", "run", "dev"]
