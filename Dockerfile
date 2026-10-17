# Use lightweight Node.js Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better Docker caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port (default 3000)
EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
