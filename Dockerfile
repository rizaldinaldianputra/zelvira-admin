FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install dependencies with retry & network hardening against ECONNRESET
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000 \
 && npm config set maxsockets 5 \
 && ( \
      attempt=1; \
      until NODE_OPTIONS="--dns-result-order=ipv4first" npm ci --legacy-peer-deps --no-audit --no-fund; do \
        if [ "$attempt" -ge 3 ]; then exit 1; fi; \
        attempt=$((attempt + 1)); \
        echo "npm ci failed, retrying ($attempt/3) in 15s..."; \
        sleep 15; \
      done \
    ) \
 && npm cache clean --force

# Copy the rest of the application
COPY . .

# Bake environment variables into the Next.js bundle during build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STORAGE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL

RUN npm run build

EXPOSE 3001

# Start the application on port 3001
CMD ["npm", "run", "start"]
