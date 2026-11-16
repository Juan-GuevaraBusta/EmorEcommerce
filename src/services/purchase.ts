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

  if (product.stock < quantity) {
    throw new HttpError(409, "Insufficient stock");
  }

  // The hook waits here without a connection. The row lock starts at the UPDATE below.
  await purchaseHooks.afterStockRead();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    if (updated.count === 0) {
      throw new HttpError(409, "Insufficient stock");
    }

    await purchaseHooks.beforePurchaseCreate();

    return tx.purchase.create({
      data: { productId, quantity },
    });
  });
}
