import { PRODUCT_ID } from "../src/constants";
import { prisma } from "../src/prisma";
import { purchase, setStock } from "./helpers";

describe("purchase validation", () => {
  beforeEach(async () => {
    await setStock(1);
  });

  test("rejects insufficient inventory", async () => {
    const response = await purchase(2);
    expect(response.status).toBe(409);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    expect(product.stock).toBe(1);
    expect(await prisma.purchase.count()).toBe(0);
  });

  test.each([0, -1, 1.5, "1", null])("rejects invalid quantity %s", async (quantity) => {
    const response = await purchase(quantity);
    expect(response.status).toBe(400);
    expect(await prisma.purchase.count()).toBe(0);
  });

  test("rejects a missing quantity", async () => {
    const response = await purchase(undefined);
    expect(response.status).toBe(400);
  });

  test("returns 404 when the product does not exist", async () => {
    const response = await fetch(`${process.env.TEST_BASE_URL}/products/missing/purchase`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quantity: 1 }),
    });
    expect(response.status).toBe(404);
  });
});
