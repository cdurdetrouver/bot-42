# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the directory
COPY package.json .

# Install the application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run the application
CMD ["npm","run", "start"]
