const prisma = require("./config/prisma");

async function testDatabase() {
  try {
    await prisma.$connect();

    const products = await prisma.product.findMany();

    console.log("✅ Product database connected");
    console.log("Products:", products);
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();