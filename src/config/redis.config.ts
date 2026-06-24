import { registerAs } from '@nestjs/config';

const DEFAULT_REDIS_URL = 'redis://redis:6379';
const DEFAULT_CACHE_NAMESPACE = 'ecommerce';
const DEFAULT_CACHE_TTL_MS = 30_000;

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL || DEFAULT_REDIS_URL,
  namespace: process.env.REDIS_CACHE_NAMESPACE || DEFAULT_CACHE_NAMESPACE,
  ttlMs: Number(process.env.REDIS_CACHE_TTL_MS || DEFAULT_CACHE_TTL_MS),
}));
