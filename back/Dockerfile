# back/Dockerfile.dev
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g @nestjs/cli

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

