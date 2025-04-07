import kafka from "../config/kafka";
import { Order } from "../models/order";

const producer = kafka.producer();

export async function initProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}

export async function sendOrderMessage(order: Order) {
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC ?? "orders",
      messages: [{ value: JSON.stringify(order) }],
    });
    console.log(`Order message sent to Kafka: ${JSON.stringify(order)}`);
  } catch (error) {
    console.error("Error sending order to Kafka:", error);
    throw error;
  }
}

export async function disconnectProducer() {
  await producer.disconnect();
}
