# Use Node.js LTS version (standard instead of alpine for better compatibility)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install ALL dependencies (including dev dependencies needed for build)
RUN npm cache clean --force
RUN npm ci --verbose

# Copy source code
COPY . .

# Build the frontend (this needs vite and other dev dependencies)
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["npm", "run", "start"] 