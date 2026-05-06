import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUsage() {
  console.log("--- USAGE AUDIT ---");
  const user = await prisma.user.findUnique({
    where: { email: 'sewix28321@inraud.com' }
  });
  
  if (user) {
    console.log(`User: ${user.email}`);
    console.log(`Scan Count: ${user.scanCount}`);
    console.log(`Optimization Count: ${user.optimizationCount}`);
    console.log(`Tier: ${user.tier}`);
  } else {
    console.log("User not found.");
  }
  
  await prisma.$disconnect();
}

checkUsage();
