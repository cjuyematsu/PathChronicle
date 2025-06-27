# Uses node version 24-alpine as our base image
FROM node:24-alpine

# Goes to src directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy rest of src into container
COPY . .

# Set port environment variable 
ENV PORT=5000

# Expose the port so computer can access it 
EXPOSE 5000

# Run the app
CMD ["npm", "run", "dev"]