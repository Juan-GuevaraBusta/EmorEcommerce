import { prisma } from "../prisma";
import { HttpError } from "../errors";

// Test seam. Default is a no-op.
export const purchaseHooks = {
  afterStockRead: async () => {},
  beforePurchaseCreate: async () => {},
};

export function resetPurchaseHooks() {
  purchaseHooks.afterStockRead = async () => {};
  purchaseHooks.beforePurchaseCreate = async () => {};
}

export async function purchaseProduct(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  // TODO: This read-then-write is not safe when two purchases run at the same time.
  if (product.stock < quantity) {
    throw new HttpError(409, "Insufficient stock");
  }

  await purchaseHooks.afterStockRead();

  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  await purchaseHooks.beforePurchaseCreate();

  return prisma.purchase.create({
    data: { productId, quantity },
  });
}
