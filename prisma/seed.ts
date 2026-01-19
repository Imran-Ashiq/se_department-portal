import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'hod_se@iub.com';
  const password = 'IubSeHod2026!';

  const hashedPassword = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Head of Department',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin created successfully!');
  console.log('Email:', superAdmin.email);
  console.log('Password:', password);
  console.log('⚠️  Please change this password after first login!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
