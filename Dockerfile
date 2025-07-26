# Use Node.js LTS version (standard instead of alpine for better compatibility)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove package-lock.json to fix npm bug with optional dependencies (rollup)
RUN rm -f package-lock.json

# Clear npm cache and do fresh install to fix rollup optional dependencies issue
RUN npm cache clean --force
RUN npm install --verbose

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