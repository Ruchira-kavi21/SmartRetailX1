const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
    host: process.env.MYSQL_HOST || "mysql",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "auth_db",
    connectionLimit: 5,
    allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({
    adapter
});

module.exports = prisma;