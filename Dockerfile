# Base stage for shared dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
RUN npm install
COPY . .
RUN npm run prisma:generate
CMD ["npm", "run", "start:dev"]

# Builder stage
FROM base AS builder
RUN npm install
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start:prod"] 