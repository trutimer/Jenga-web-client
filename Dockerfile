# --- Build Stage ---
FROM --platform=linux/amd64 node:20-alpine AS build-stage

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
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

# Copy built files
COPY --from=build-stage /app/dist ./dist

# Expose internal port
EXPOSE 3030

# Run static server
CMD ["serve", "-s", "dist", "-l", "3030"]