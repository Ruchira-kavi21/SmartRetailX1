const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "rootpassword",
  database: "product_db",
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;