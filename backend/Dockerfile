FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY backend . .

ENV PORT=5000
ENV DB_PATH=/var/data/todos.db

EXPOSE 5000

CMD ["node", "src/server.js"]
