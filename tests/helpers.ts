import { prisma } from "../src/prisma";
import { PRODUCT_ID } from "../src/constants";

export async function setStock(stock: number) {
  await prisma.purchase.deleteMany();
  await prisma.product.upsert({
    where: { id: PRODUCT_ID },
    update: { name: "Ticket", stock },
    create: { id: PRODUCT_ID, name: "Ticket", stock },
  });
}

export async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${process.env.TEST_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

export function purchase(quantity: unknown) {
  return api(`/products/${PRODUCT_ID}/purchase`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}
