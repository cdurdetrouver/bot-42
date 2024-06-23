# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package.json package-lock.json ./
RUN npm install --only=production

# Switch to 'node' user
USER node

CMD ["npm", "run", "start-prod"]
