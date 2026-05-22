import Redis from 'ioredis';

function buildOptions(url: string) {
  const isTLS = url.startsWith('rediss://');
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTLS ? { rejectUnauthorized: false } : undefined,
  };
}

export function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  return new Redis(url, buildOptions(url));
}

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(url, buildOptions(url));
    redisClient.on('error', (err) => console.error('Redis error:', err.message));
    redisClient.on('connect', () => console.log('Redis connected'));
  }
  return redisClient;
}
