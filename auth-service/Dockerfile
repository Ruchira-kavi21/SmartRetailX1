FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="mysql://root:dummy@localhost:3306/auth_db" npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]