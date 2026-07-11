import { createClient } from 'redis';

type CacheEntry = {
  value: string;
  expiresAt?: number;
};

const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({
  url: redisUrl || 'redis://127.0.0.1:6379',
  socket: {
    connectTimeout: 1000,
    // A Lambda invocation must not wait for Redis reconnect attempts.
    reconnectStrategy: false,
  },
});

const memoryStore = new Map<string, CacheEntry>();
let useMemoryFallback = !redisUrl;
let connectionAttempt: Promise<void> | undefined;

const isExpired = (entry?: CacheEntry) => {
  return !!entry?.expiresAt && entry.expiresAt <= Date.now();
};

const patternToRegExp = (pattern: string) => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`);
};

const memoryClient = {
  get: async (key: string) => {
    const entry = memoryStore.get(key);
    if (!entry) return null;

    if (isExpired(entry)) {
      memoryStore.delete(key);
      return null;
    }

    return entry.value;
  },
  setEx: async (key: string, ttlSeconds: number, value: string) => {
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },
  del: async (keyOrKeys: string | string[]) => {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    let removed = 0;
    for (const key of keys) {
      if (memoryStore.delete(key)) {
        removed += 1;
      }
    }
    return removed;
  },
  keys: async (pattern: string) => {
    const matcher = patternToRegExp(pattern);
    const keys: string[] = [];

    for (const [key, entry] of memoryStore.entries()) {
      if (isExpired(entry)) {
        memoryStore.delete(key);
        continue;
      }

      if (matcher.test(key)) {
        keys.push(key);
      }
    }

    return keys;
  },
};

redisClient.on('error', (err) => {
  if (!useMemoryFallback) {
    console.error('Redis Client Error', err);
  }
});
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
  if (useMemoryFallback) {
    return;
  }

  if (redisClient.isOpen) {
    return;
  }

  if (!connectionAttempt) {
    connectionAttempt = redisClient
      .connect()
      .then(() => undefined)
      .catch((error) => {
        useMemoryFallback = true;
        console.warn('Redis unavailable, using in-memory fallback', error);
      })
      .finally(() => {
        connectionAttempt = undefined;
      });
  }

  await connectionAttempt;
};

const client = {
  get isOpen() {
    return useMemoryFallback || redisClient.isOpen;
  },
  connect: async () => {
    if (useMemoryFallback) return;
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  },
  get: async (key: string) => {
    await connectRedis();
    return useMemoryFallback ? memoryClient.get(key) : redisClient.get(key);
  },
  setEx: async (key: string, ttlSeconds: number, value: string) => {
    await connectRedis();
    return useMemoryFallback
      ? memoryClient.setEx(key, ttlSeconds, value)
      : redisClient.setEx(key, ttlSeconds, value);
  },
  del: async (keyOrKeys: string | string[]) => {
    await connectRedis();
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    return useMemoryFallback
      ? memoryClient.del(keys)
      : (redisClient.del as unknown as (...args: string[]) => Promise<number>)(...keys);
  },
  keys: async (pattern: string) => {
    await connectRedis();
    return useMemoryFallback ? memoryClient.keys(pattern) : redisClient.keys(pattern);
  },
  quit: async () => {
    if (!useMemoryFallback && redisClient.isOpen) {
      await redisClient.quit();
    }
  },
};

export default client;
