FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g @nestjs/cli

COPY . .

# Prisma Client の自動生成
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


