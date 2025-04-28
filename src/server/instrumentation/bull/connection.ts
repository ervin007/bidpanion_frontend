import { Redis } from "ioredis";
import { serverEnv } from "@/env";

// Build connection options with required fields
const connectionOptions: Record<string, any> = {
  host: serverEnv.REDIS_HOST,
  port: serverEnv.REDIS_PORT,
  maxRetriesPerRequest: null,
};

if (serverEnv.REDIS_USERNAME) {
  connectionOptions.username = serverEnv.REDIS_USERNAME;
}

if (serverEnv.REDIS_PASSWORD) {
  connectionOptions.password = serverEnv.REDIS_PASSWORD;
}

if (serverEnv.REDIS_TLS) {
  connectionOptions.tls = serverEnv.REDIS_TLS;
}

export const bullConnection = new Redis(connectionOptions);

bullConnection.on("connect", () => {
  console.log("🐂 BullMQ connected to Redis");
});

bullConnection.on("error", (err) => {
  console.error("🐂 BullMQ Redis connection error:", err);
});

bullConnection.on("close", () => {
  console.log("🐂 BullMQ Redis connection closed");
});

bullConnection.on("reconnecting", () => {
  console.log("🐂 BullMQ reconnecting to Redis...");
});
