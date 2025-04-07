import kafka from "../config/kafka";
import { Order } from "../models/order";
import { getBalance, updateBalance } from "../models/balance";

const consumer = kafka.consumer({ groupId: "order-processor" });

export async function initConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC ?? "orders",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;

        const order: Order = JSON.parse(message.value.toString());
        console.log(`Processing order: ${JSON.stringify(order)}`);

        await processOrder(order);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });

  console.log("Kafka consumer started");
}

async function processOrder(order: Order) {
  console.warn(`Process ordered called`);
  const { user_id, order_type, currency_symbol, quantity, price } = order;

  try {
    let currentBalance = await getBalance(user_id, currency_symbol);
    // Convert to number using parseFloat to ensure we have a numeric value
    let newBalance = currentBalance
      ? parseFloat(currentBalance.balance.toString())
      : 0;

    // Process based on order type
    if (order_type === "buy") {
      console.log(quantity, price, "buy");
      // Add quantity to the user's balance
      // Use parseFloat to ensure both values are treated as numbers
      const addAmount =
        parseFloat(quantity.toString()) * parseFloat(price.toString());
      console.log(addAmount, "add amount");
      newBalance = newBalance + addAmount;
      console.log(newBalance, "new balance");
      console.log(
        `Adding ${quantity} ${currency_symbol} to user ${user_id}'s balance`
      );
    } else if (order_type === "sell") {
      // Convert to numbers for calculation
      const deductAmount =
        parseFloat(quantity.toString()) * parseFloat(price.toString());

      // Check if user has enough balance
      if (!currentBalance || newBalance < deductAmount) {
        console.error(
          `User ${user_id} has insufficient ${currency_symbol} balance for sell order`
        );
        return;
      }

      // Deduct quantity from the user's balance
      newBalance -= deductAmount;
      console.log(
        `Deducting ${quantity} ${currency_symbol} from user ${user_id}'s balance`
      );
    }

    // Format the balance to avoid excessive decimal places
    // This limits decimal places to a reasonable number (e.g., 8 for crypto)
    const formattedBalance = parseFloat(newBalance.toFixed(8));

    // Update the balance in the database
    await updateBalance(user_id, currency_symbol, formattedBalance);
    console.log(
      `Updated balance for user ${user_id}: ${formattedBalance} ${currency_symbol}`
    );
  } catch (error) {
    console.error("Error processing order:", error);
  }
}

export async function disconnectConsumer() {
  await consumer.disconnect();
}
