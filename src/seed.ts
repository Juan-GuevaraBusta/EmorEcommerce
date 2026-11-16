import { prisma } from "./prisma";
import { PRODUCT_ID } from "./constants";

async function main() {
  await prisma.product.upsert({
    where: { id: PRODUCT_ID },
    update: { name: "Ticket", stock: 1 },
    create: { id: PRODUCT_ID, name: "Ticket", stock: 1 },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
