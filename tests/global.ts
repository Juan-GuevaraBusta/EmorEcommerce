import type { AddressInfo } from "net";
import { app } from "../src/app";
import { prisma } from "../src/prisma";
import { resetPurchaseHooks } from "../src/services/purchase";

let server: ReturnType<typeof app.listen>;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address() as AddressInfo;
  process.env.TEST_BASE_URL = `http://127.0.0.1:${address.port}`;
});

beforeEach(() => {
  resetPurchaseHooks();
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await prisma.$disconnect();
});
