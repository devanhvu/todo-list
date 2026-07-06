#  Stage 1: Build 
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

# Build with VITE_API_URL pointing to the backend service
ARG VITE_API_URL=http://backend:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with nginx 
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serve SPA and proxy /api to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
