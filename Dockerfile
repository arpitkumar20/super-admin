# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Expose Vite preview port
EXPOSE 3000

# Run production preview server
CMD ["npm", "run", "preview", "--", "--host", "--port", "3000"]
