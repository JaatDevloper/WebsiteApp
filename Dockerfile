# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Expose port (Koyeb will set PORT environment variable)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
