# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev for prisma generate)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# ===== Stage 2: Production Dependencies =====
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ===== Stage 3: Production Image =====
FROM node:20-alpine AS runner

# Set to production
ENV NODE_ENV=production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy prisma client from deps stage
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
