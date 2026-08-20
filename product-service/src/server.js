require("dotenv").config();
const mariadb = require("mariadb");
const app = require("./app");

const PORT = process.env.PORT || 5002;

async function initDb() {
  try {
    const conn = await mariadb.createConnection({
      host: process.env.MYSQL_HOST || "mysql",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD,
      allowPublicKeyRetrieval: true
    });

    await conn.query("CREATE DATABASE IF NOT EXISTS product_db");
    await conn.query("USE product_db");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        stock INT DEFAULT 0,
        status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    const countRes = await conn.query("SELECT COUNT(*) as cnt FROM products");
    const count = Number(countRes[0].cnt);
    if (count === 0) {
      await conn.query(`
        INSERT INTO products (name, description, sku, price, category, stock, status) VALUES
        ('Smart 4K TV', '55 inch Ultra HD Smart LED TV', 'TV-4K-55', 499.99, 'Electronics', 50, 'ACTIVE'),
        ('Wireless Headphones', 'Noise-canceling over-ear bluetooth headphones', 'AUDIO-WH-100', 129.50, 'Electronics', 120, 'ACTIVE'),
        ('Ergonomic Office Chair', 'Breathable mesh high-back chair', 'FURN-CHAIR-01', 189.00, 'Furniture', 30, 'ACTIVE')
      `);
      console.log("🌱 Seeded initial products");
    }

    await conn.end();
    console.log("✅ Product DB initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Product Service running on port ${PORT}`);
  });
});