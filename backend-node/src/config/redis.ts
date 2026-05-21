import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    // Upstash uses rediss:// (TLS) — ioredis needs tls option enabled
    const isTLS = url.startsWith('rediss://');

    redisClient = new Redis(url, {
      maxRetriesPerRequest: null,
      tls: isTLS ? {} : undefined,
    });

    redisClient.on('error', (err) => console.error('Redis error:', err.message));
    redisClient.on('connect', () => console.log('Redis connected'));
  }
  return redisClient;
}
