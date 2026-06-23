# syntax=docker/dockerfile:1

###############################
# Base: shared setup
###############################
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

###############################
# Development stage
# Used by docker-compose for local dev (hot-reload via nest start --watch)
###############################
FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]

###############################
# Build stage
# Compiles TypeScript -> dist/, used only to produce build output
###############################
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

###############################
# Production stage
# Slim runtime: only prod deps + compiled dist/, runs as non-root user
###############################
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

# Run as non-root for basic container hardening
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
USER nestjs

EXPOSE 3000
CMD ["node", "dist/main.js"]
