# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the project
# RUN npm run build
RUN npm install -g nodemon
# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["nodemon", "app.ts"]