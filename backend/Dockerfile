# Medical Management System Backend - Simplified Multi-stage Build

# Stage 1: Base image with common setup
FROM node:18-alpine AS base

# Install dumb-init and create non-root user in one layer
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app
RUN chown nodeuser:nodejs /app

# Stage 2: Dependencies (supports both prod and dev)
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install dependencies based on NODE_ENV
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then \
        npm ci --no-audit --no-fund; \
    else \
        npm ci --only=production --no-audit --no-fund; \
    fi && \
    npm cache clean --force

# Stage 3: Production image
FROM base AS production

ENV NODE_ENV=production PORT=5000

# Copy production dependencies
COPY --from=dependencies --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Clean up unnecessary files and create logs directory
RUN rm -rf .git .gitignore README.md Dockerfile docker-compose.yml .dockerignore .env.example && \
    mkdir -p logs && chown -R nodeuser:nodejs logs

USER nodeuser
EXPOSE $PORT

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "ls -l scripts && exec node server.js"]


