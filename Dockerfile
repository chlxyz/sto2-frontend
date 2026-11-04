# ==================================
# Stage 1: Build React application
# ==================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# API origin is configurable during build. Empty = same origin, which is what
# the nginx container serves (it proxies /api, /sanctum and /storage).
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

# Client-side admin UI gate; keep in sync with backend ADMIN_EMAIL.
ARG VITE_ADMIN_EMAIL=admin@gmail.com
ENV VITE_ADMIN_EMAIL=$VITE_ADMIN_EMAIL

# Build production assets
RUN npm run build


# ==================================
# Stage 2: Production Nginx server
# ==================================
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]