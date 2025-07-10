# Uses node version 24-alpine as our base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package.json for backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Go back to root and copy everything
WORKDIR /app
COPY . ./

# Set working directory to backend for running
WORKDIR /app/backend

# Set port environment variable 
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Run the app
CMD ["npm", "run", "dev"]