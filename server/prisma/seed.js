const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  // If your schema requires `name`, `email`, `passwordHash`, and `role`, this matches it.
  await prisma.user.createMany({
    data: [
      { name: "Admin User",  email: "admin@example.com", passwordHash: hash, role: "ADMIN" },
      { name: "Store Owner", email: "owner@example.com", passwordHash: hash, role: "OWNER" },
      { name: "Normal User", email: "user@example.com",  passwordHash: hash, role: "USER"  },
    ],
    skipDuplicates: true, // safe if email is unique
  });

  console.log("✅ Seeded users (password: 123456) → admin/owner/user");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
