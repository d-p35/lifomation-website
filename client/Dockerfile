# Stage 1: Build the Angular application
FROM node:18-alpine as build

WORKDIR /client/src

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the project
RUN npm run build

# Expose port 4200
EXPOSE 4200

# Serve these static files with NGINX.
FROM nginx:1.21.6-alpine
COPY --from=build /client/src/dist/client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# # Start the Angular application
# CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]