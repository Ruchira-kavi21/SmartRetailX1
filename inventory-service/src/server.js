require("dotenv").config();
const mariadb = require("mariadb");
const app = require("./app");

const PORT = process.env.PORT || 5004;

async function initDb() {
  try {
    const conn = await mariadb.createConnection({
      host: process.env.MYSQL_HOST || "mysql",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD,
      allowPublicKeyRetrieval: true
    });

    await conn.query("CREATE DATABASE IF NOT EXISTS inventory_db");
    await conn.query("USE inventory_db");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId INT UNIQUE NOT NULL,
        quantity INT DEFAULT 0,
        reserved INT DEFAULT 0,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    await conn.end();
    console.log("✅ Inventory DB initialized successfully");
  } catch (err) {
    console.error("❌ Inventory Database initialization error:", err);
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Inventory Service running on port ${PORT}`);
  });
});
