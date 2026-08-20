import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 5000);
  },
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  },
  async set(key: string, value: unknown, ttlSec = 300): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttlSec);
  },
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
  async lock(key: string, ttlMs = 10000): Promise<boolean> {
    const result = await redis.set(`lock:${key}`, "1", "PX", ttlMs, "NX");
    return result === "OK";
  },
  async unlock(key: string): Promise<void> {
    await redis.del(`lock:${key}`);
  },
};
