FROM node:18-alpine AS build

WORKDIR /app

# Copy package files from frontend directory
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code from frontend directory
COPY ./frontend/src ./src
COPY ./frontend/public ./public
COPY ./frontend/index.html ./
COPY ./frontend/vite.config.js ./

# Accept build argument for API URL with default fallback
ARG VITE_API_URL=http://localhost:5000
ARG REACT_APP_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the application
RUN npm run build


# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static site
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
