import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "crypto-trading-app",
  brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
});

export default kafka;
