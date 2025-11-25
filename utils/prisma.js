const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Database connection test
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  testConnection
};
