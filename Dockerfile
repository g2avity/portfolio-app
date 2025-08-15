# Use Node.js 24 from a different registry
FROM cimg/node:24.5.0 AS base

# Install dependencies for native modules and Prisma
RUN sudo apt-get update && sudo apt-get install -y \
    libc6 \
    openssl \
    && sudo rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS deps
RUN npm ci

# Generate Prisma client
FROM deps AS prisma
RUN npx prisma generate

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

# Ensure proper permissions for build process
RUN sudo chown -R circleci:circleci /app && \
    sudo mkdir -p /app/build && \
    sudo chown -R circleci:circleci /app/build

# Generate Prisma client in build context
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS runner

# Create non-root user for security (using high UIDs to avoid all conflicts)
RUN sudo groupadd --system --gid 9999 nodejs && \
    sudo useradd --system --uid 9999 nextjs

# Create home directory for nextjs user with proper permissions
RUN sudo mkdir -p /home/nextjs && \
    sudo chown -R nextjs:nodejs /home/nextjs

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules/.prisma ./app/node_modules/.prisma
COPY --from=builder /app/package*.json ./

# Change ownership to non-root user before npm operations
RUN sudo chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Install only production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "run", "start"]