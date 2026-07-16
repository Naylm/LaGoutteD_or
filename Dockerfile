# Étape 1 : Build du frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Étape 2 : Serveur Node.js + frontend buildé
FROM node:20-alpine AS runner
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY server/package.json ./server/
RUN cd server && npm install
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.js"]
