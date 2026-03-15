# Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
ENV VITE_API_BASE_URL=""
RUN npm run build

# Nginx with frontend static files + reverse proxy config
FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist/ /usr/share/nginx/html/
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf
EXPOSE 80
