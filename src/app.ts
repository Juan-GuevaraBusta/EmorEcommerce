import express from "express";
import { router } from "./routes/products";
import { HttpError } from "./errors";

export const app = express();

app.use(express.json());
app.use(router);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});
