import { PRODUCT_ID } from "../src/constants";
import { prisma } from "../src/prisma";
import { purchaseHooks } from "../src/services/purchase";
import { purchase, setStock } from "./helpers";

function holdUntil(count: number) {
  let arrived = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  purchaseHooks.afterStockRead = async () => {
    arrived += 1;
    if (arrived >= count) {
      release();
    }
    await gate;
  };
}

describe("concurrency", () => {
  jest.setTimeout(20000);

  jest.setTimeout(20000);

  test("only one buyer gets the last item", async () => {
    await setStock(1);
    holdUntil(20);

    const responses = await Promise.all(Array.from({ length: 20 }, () => purchase(1)));
    const successes = responses.filter((response) => response.status === 201);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    expect(successes).toHaveLength(1);
    expect(product.stock).toBe(0);
    expect(await prisma.purchase.count()).toBe(1);
  });

  test("sells only the available units", async () => {
    await setStock(10);
    holdUntil(50);

    const responses = await Promise.all(Array.from({ length: 50 }, () => purchase(1)));
    const successes = responses.filter((response) => response.status === 201);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    expect(successes).toHaveLength(10);
    expect(product.stock).toBe(0);
    expect(await prisma.purchase.count()).toBe(10);
  });

  test("never sells more than the stock on hand", async () => {
    await setStock(5);
    holdUntil(5);

    await Promise.all([2, 2, 2, 2, 2].map((quantity) => purchase(quantity)));

    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    const sold = await prisma.purchase.aggregate({ _sum: { quantity: true } });
    expect(sold._sum.quantity ?? 0).toBeLessThanOrEqual(5);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    expect(product.stock).toBe(5 - (sold._sum.quantity ?? 0));
  });

  test("a failure after the stock change does not keep the deduction", async () => {
    await setStock(5);
    purchaseHooks.beforePurchaseCreate = async () => {
      throw new Error("forced failure");
    };

    const response = await purchase(1);
    expect(response.status).toBe(500);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    expect(product.stock).toBe(5);
    expect(await prisma.purchase.count()).toBe(0);
  });
});
