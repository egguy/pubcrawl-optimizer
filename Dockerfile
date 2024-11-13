# Use Node.js 22 as the base image
FROM node:22 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -D

# Copy the rest of the application code
COPY . .

# Build the SvelteKit application
RUN npm run build

# Use Node.js 22 as the base image
FROM node:22 AS runner

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install production dependencies
RUN npm install --only=production

# Copy the built SvelteKit application
COPY --from=builder /app/build /app/build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "build"]