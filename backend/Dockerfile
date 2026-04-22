FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
COPY seed.json ./seed.json

EXPOSE 3001
CMD ["npx", "tsx", "src/server.ts"]
