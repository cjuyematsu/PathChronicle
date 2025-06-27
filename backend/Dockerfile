# Uses node version 22 as our base image
FROM node:22

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