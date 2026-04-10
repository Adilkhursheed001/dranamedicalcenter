require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function main() {
  const username = 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed },
  });

  console.log(`✅ Admin upserted — username: "${username}"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
