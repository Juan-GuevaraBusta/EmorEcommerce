import { PRODUCT_ID } from "../src/constants";
import { prisma } from "../src/prisma";
import { api, purchase, setStock } from "./helpers";

describe("products", () => {
  beforeEach(async () => {
    await setStock(1);
  });

  test("returns the product and its inventory", async () => {
    const list = await api("/products");
    expect(list.status).toBe(200);
    expect(list.body).toEqual([{ id: PRODUCT_ID, name: "Ticket", stock: 1 }]);

    const one = await api(`/products/${PRODUCT_ID}`);
    expect(one.status).toBe(200);
    expect(one.body).toEqual({ id: PRODUCT_ID, name: "Ticket", stock: 1 });
  });

  test("returns 404 for an unknown product", async () => {
    const response = await api("/products/missing");
    expect(response.status).toBe(404);
  });

  test("purchases one item and records it", async () => {
    const response = await purchase(1);
    expect(response.status).toBe(201);
    expect(response.body.productId).toBe(PRODUCT_ID);
    expect(response.body.quantity).toBe(1);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: PRODUCT_ID } });
    expect(product.stock).toBe(0);

    const purchases = await api("/purchases");
    expect(purchases.status).toBe(200);
    expect(purchases.body).toHaveLength(1);
    expect(purchases.body[0].quantity).toBe(1);
  });
});
