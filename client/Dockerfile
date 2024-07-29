# Stage 1: Build the Angular application
FROM node:18-alpine as build

WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the project
RUN npm run build --prod

# Stage 2: Serve the static files with NGINX
FROM nginx:1.21.6-alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

# Copy the nginx configuration file
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
