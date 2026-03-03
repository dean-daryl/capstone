# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build with empty API base URL so frontend makes same-origin requests through Nginx
ENV VITE_API_BASE_URL=""
RUN npm run build

# Output stage — copies built files into the mounted volume at startup
FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/dist /app/build-output
CMD ["cp", "-r", "/app/build-output/.", "/app/dist/"]
