# Build stage
FROM node:22.17.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (cached if lockfile doesn't change)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:22.17.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ppr/health || exit 1

# Start application
CMD ["node", "dist/bootstrap/main.js"]
