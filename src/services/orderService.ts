import { Order, upsertOrder } from "../models/order";
import { sendOrderMessage } from "../kafka/producer";

export async function placeOrder(orderData: Order): Promise<Order> {
  try {
    // Validate order data
    if (orderData.user_id < 1 || orderData.user_id > 10) {
      throw new Error("User ID must be between 1 and 10");
    }

    if (orderData.order_type !== "buy" && orderData.order_type !== "sell") {
      throw new Error('Order type must be either "buy" or "sell"');
    }

    if (orderData.price < 1.123456 || orderData.price > 9.123456) {
      throw new Error("Price must be between 1.123456 and 9.123456");
    }

    if (orderData.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    // Create order in database
    const { id, quantity } = await upsertOrder(orderData);

    // Create a complete order object with the new ID
    const completeOrder = {
      ...orderData,
      Id: id,
      quantity,
      status: "open",
    };

    // Send order to Kafka
    await sendOrderMessage(completeOrder);

    return completeOrder;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
}
