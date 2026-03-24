FROM node:18-alpine

WORKDIR /app

# Copy only package files from backend directory
COPY ./backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy application source code from backend directory
COPY ./backend/src ./src
COPY ./backend/data ./data

ENV PORT=5000
ENV DB_PATH=/tmp/todos.db

EXPOSE 5000

CMD ["node", "src/server.js"]
