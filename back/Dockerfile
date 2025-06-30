FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

#prismaのbuild

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD [ "node","dist/main" ]
