import Redis from 'ioredis';
import { REDIS_URL } from './env.js';

let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
} else {
  console.warn('REDIS_URL not found, BullMQ features will be disabled.');
}

export default redis;
