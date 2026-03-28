FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY scripts/ ./scripts/

RUN mkdir -p /app/data /app/uploads

EXPOSE 3001
CMD ["node", "src/server.js"]
