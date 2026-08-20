require("dotenv").config();
const mariadb = require("mariadb");
const app = require("./app");

const PORT = process.env.PORT || 5003;

async function initDb() {
  try {
    const conn = await mariadb.createConnection({
      host: process.env.MYSQL_HOST || "mysql",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD,
      allowPublicKeyRetrieval: true
    });

    await conn.query("CREATE DATABASE IF NOT EXISTS order_db");
    await conn.query("USE order_db");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    await conn.end();
    console.log("✅ Order DB initialized successfully");
  } catch (err) {
    console.error(" Order Database initialization error:", err);
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(` Order Service running on port ${PORT}`);
  });
});