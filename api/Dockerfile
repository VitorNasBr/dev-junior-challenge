# ---- Stage 1: install dependencies and compile TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app

# Prisma needs OpenSSL to run its query engine.
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ---- Stage 2: image that actually runs ----
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Applies pending migrations (creates the tables on the first run), then starts the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
