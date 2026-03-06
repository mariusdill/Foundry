import { prisma } from "./client";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@foundry.local";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Foundry Admin";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "admin" },
    create: { email: adminEmail, name: adminName, role: "admin" },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
