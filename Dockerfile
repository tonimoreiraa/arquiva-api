# Use a imagem Node.js 18
FROM node:18

# Instala dependencias
WORKDIR /app

COPY package*.json ./
RUN npm install

# Builda
COPY . .
RUN node ace build --production --ignore-ts-errors

# Produção
WORKDIR /app/build

RUN npm install --production

EXPOSE 3333

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

WORKDIR /app


CMD ["node", "build/server.js"]
