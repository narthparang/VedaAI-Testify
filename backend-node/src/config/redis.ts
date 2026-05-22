import Redis from 'ioredis';

function buildOptions(url: string) {
  const isTLS = url.startsWith('rediss://');
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTLS ? { rejectUnauthorized: false } : undefined,
    keepAlive: 10000,
    connectTimeout: 10000,
    retryStrategy: (times: number) => Math.min(times * 200, 2000),
  };
}

function attachPingInterval(client: Redis): void {
  // Upstash free tier drops idle connections after ~20s; ping every 15s to prevent it
  const interval = setInterval(() => {
    client.ping().catch(() => {});
  }, 15000);
  client.on('close', () => clearInterval(interval));
}

export function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = new Redis(url, buildOptions(url));
  attachPingInterval(client);
  return client;
}

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(url, buildOptions(url));
    redisClient.on('error', (err) => console.error('Redis error:', err.message));
    redisClient.on('connect', () => console.log('Redis connected'));
    attachPingInterval(redisClient);
  }
  return redisClient;
}
