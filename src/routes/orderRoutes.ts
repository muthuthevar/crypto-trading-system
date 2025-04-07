import { Request, Response, Router } from "express";
import { createOrderHandler } from "../controllers/orderController";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  createOrderHandler(req, res);
});

export default router;
