FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL=file:./dev.db
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production DATABASE_URL=file:/data/dev.db PORT=3000 TZ=America/Merida
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package.json ./
VOLUME /data
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node build"]
