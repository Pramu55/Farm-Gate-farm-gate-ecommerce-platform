FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
EXPOSE 4002
CMD ["node", "dist/index.js"]