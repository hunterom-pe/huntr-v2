import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log("--- DATABASE AUDIT ---");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  if (users.length === 0) {
    console.log("CRITICAL: User table is empty.");
  } else {
    users.forEach(u => {
      console.log(`User: ${u.email} | Title: ${u.jobTitle} | Location: ${u.location}`);
    });
  }
  
  await prisma.$disconnect();
}

check();
