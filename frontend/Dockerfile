FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5000
ARG REACT_APP_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "API_URL=${VITE_API_URL:-${REACT_APP_API_URL:-http://localhost:5000}}; printf 'window.__APP_CONFIG__={API_URL:\"%s\"};\n' \"$API_URL\" > dist/config.js; serve -s dist -l ${PORT}"]
