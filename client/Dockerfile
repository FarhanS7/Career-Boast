# frontend/Dockerfile
# multi-stage build for Next.js (production)

# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (use package-lock for reproducible installs)
# Copy package files first to leverage Docker cache
COPY package*.json ./
# If using pnpm or yarn, adjust accordingly
RUN npm ci

# Copy source
COPY . .

# Build the Next app (App Router or Pages)
# This will produce .next and required build artifacts
RUN npm run build

# --- PRODUCTION RUNTIME ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# copy next config if present (harmless if missing)
COPY --from=builder /app/next.config.mjs ./next.config.mjs 2>/dev/null || true
COPY --from=builder /app/next.config.js ./next.config.js 2>/dev/null || true

# Expose default Next port
EXPOSE 3000

# Start the Next server
# NOTE: next start serves the production build
CMD ["npm", "start"]
