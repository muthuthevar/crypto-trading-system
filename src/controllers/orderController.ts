import { Request, Response } from "express";
import { placeOrder } from "../services/orderService";

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const { user_id, order_type, currency_symbol, price, quantity } = req.body;

    // Validate request body
    if (!user_id || !order_type || !currency_symbol || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await placeOrder({
      user_id: parseInt(user_id),
      order_type,
      currency_symbol,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
