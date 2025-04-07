import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
// Define the Order interface
export interface Order {
  user_id: number;
  order_type: string;
  currency_symbol: string;
  price: number;
  quantity: number;
  status?: string;
}

// Define our record interface extending RowDataPacket
interface ExistingOrder extends RowDataPacket {
  id: number;
  quantity: string | number;
}

export async function upsertOrder(
  order: Order
): Promise<{ id: number; action: "inserted" | "updated"; quantity: number }> {
  // First check if matching order exists
  const [existingOrders] = await pool.execute<ExistingOrder[]>(
    "SELECT id, quantity FROM Orders WHERE user_id = ? AND order_type = ? AND currency_symbol = ? AND price = ? AND status = ?",
    [
      order.user_id,
      order.order_type,
      order.currency_symbol,
      order.price,
      order.status ?? "open",
    ]
  );

  if (existingOrders && existingOrders.length > 0) {
    // Update existing order by increasing quantity
    const existingOrder = existingOrders[0];
    const newQuantity =
      parseFloat(existingOrder.quantity.toString()) +
      parseFloat(order.quantity.toString());

    await pool.execute<ResultSetHeader>(
      "UPDATE Orders SET quantity = ? WHERE id = ?",
      [newQuantity, existingOrder.id]
    );

    // Return the updated order ID
    return {
      id: existingOrder.id,
      action: "updated",
      quantity: newQuantity,
    };
  } else {
    // Insert new order
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Orders (user_id, order_type, currency_symbol, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        order.user_id,
        order.order_type,
        order.currency_symbol,
        order.price,
        order.quantity,
        order.status ?? "open",
      ]
    );

    // Return the new order ID
    return {
      id: result.insertId,
      action: "inserted",
      quantity: order.quantity,
    };
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  const [rows] = await pool.execute("SELECT * FROM Orders WHERE Id = ?", [id]);
  const orderRows = rows as Order[];
  return orderRows.length > 0 ? orderRows[0] : null;
}

export async function updateOrderStatus(
  id: number,
  status: "open" | "closed" | "cancelled"
): Promise<boolean> {
  const [result] = await pool.execute(
    "UPDATE Orders SET status = ? WHERE Id = ?",
    [status, id]
  );

  return (result as any).affectedRows > 0;
}
