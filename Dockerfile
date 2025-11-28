# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ \
    && npm install --legacy-peer-deps \
    && npm cache clean --force
COPY . .
# Skip preflight checks and set environment variables
ENV SKIP_PREFLIGHT_CHECK=true
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Create nginx config directly in the Dockerfile
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_min_length 1000; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Content-Type-Options "nosniff"; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
