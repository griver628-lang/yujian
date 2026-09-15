import { PrismaClient } from '@prisma/client';
import { INITIAL_GLOSSARY_TERMS } from '../src/glossary/glossary.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 正在向数据库初始化科普名词数据...');
  for (const item of INITIAL_GLOSSARY_TERMS) {
    await prisma.glossary.upsert({
      where: { name: item.name },
      update: {
        brief: item.brief,
        content: item.content,
        colorTag: item.colorTag,
      },
      create: {
        name: item.name,
        brief: item.brief,
        content: item.content,
        colorTag: item.colorTag,
      },
    });
  }
  console.log(`✅ 成功初始化 ${INITIAL_GLOSSARY_TERMS.length} 条科普名词数据！`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
