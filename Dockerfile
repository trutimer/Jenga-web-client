# --- Build Stage ---
FROM --platform=linux/amd64 node:20-alpine AS build-stage

# Install build dependencies for native modules (better-sqlite3, etc.)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm install --frozen-lockfile --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# We can pass build-time arguments here if needed (e.g., VITE_API_BASE_URL)
RUN npm run build

# --- Production Stage ---
FROM --platform=linux/amd64 nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom hardened Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose HTTP ports (both 80 and 3030 for backward compatibility)
EXPOSE 80 3030

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]