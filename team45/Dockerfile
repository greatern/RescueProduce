# Multi-stage build for React + Typescript + Vite
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package file
COPY package*.json ./

# Install dependencies (including dev deps)
RUN npm i

COPY . .

# Build the application
RUN npx vite build

# Production stage with nginx
FROM nginx:alpine

# Copy build assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start
CMD [ "nginx", "-g", "daemon off;" ]