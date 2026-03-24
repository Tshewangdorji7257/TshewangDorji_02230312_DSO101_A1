FROM node:18-alpine

WORKDIR /app

# Copy package files from backend directory
COPY ./backend/package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY ./backend/src ./src

# Ensure tmp directory exists and is writable
RUN mkdir -p /tmp && chmod 777 /tmp

ENV PORT=5000
ENV DB_PATH=/tmp/todos.json
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
