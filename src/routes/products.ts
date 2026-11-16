import { Router } from "express";
import { prisma } from "../prisma";
import { HttpError } from "../errors";
import { purchaseProduct } from "../services/purchase";

export const router = Router();

router.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post("/products/:id/purchase", async (req, res, next) => {
  try {
    const quantity = req.body?.quantity;
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, "quantity must be a positive integer");
    }
    const purchase = await purchaseProduct(req.params.id, quantity);
    res.status(201).json(purchase);
  } catch (error) {
    next(error);
  }
});

router.get("/purchases", async (_req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({ orderBy: { createdAt: "asc" } });
    res.json(purchases);
  } catch (error) {
    next(error);
  }
});
