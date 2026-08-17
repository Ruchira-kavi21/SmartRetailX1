FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="mysql://root:dummy@mysql:3306/inventory_db" npx prisma generate

EXPOSE 5004

CMD ["npm", "start"]
