const NodeCache = require('node-cache');

// Create cache instances with different TTL for different data types
const productCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes for products
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Better performance, but be careful with object mutations
  maxKeys: 1000 // Limit cache size
});

const userCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes for user data
  checkperiod: 120,
  useClones: false,
  maxKeys: 500
});

const cartCache = new NodeCache({ 
  stdTTL: 180, // 3 minutes for cart data (shorter due to frequent updates)
  checkperiod: 30,
  useClones: false,
  maxKeys: 1000
});

const orderCache = new NodeCache({ 
  stdTTL: 900, // 15 minutes for orders
  checkperiod: 180,
  useClones: false,
  maxKeys: 2000
});

// Cache statistics tracking
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

// Generic cache wrapper with statistics
const createCacheWrapper = (cache, name) => ({
  get: (key) => {
    const value = cache.get(key);
    if (value !== undefined) {
      cacheStats.hits++;
      console.log(`Cache HIT for ${name}:${key}`);
    } else {
      cacheStats.misses++;
      console.log(`Cache MISS for ${name}:${key}`);
    }
    return value;
  },
  
  set: (key, value, ttl) => {
    cacheStats.sets++;
    return cache.set(key, value, ttl);
  },
  
  del: (key) => {
    cacheStats.deletes++;
    return cache.del(key);
  },
  
  flush: () => cache.flushAll(),
  
  keys: () => cache.keys(),
  
  getStats: () => cache.getStats()
});

// Export wrapped cache instances
module.exports = {
  productCache: createCacheWrapper(productCache, 'product'),
  userCache: createCacheWrapper(userCache, 'user'),
  cartCache: createCacheWrapper(cartCache, 'cart'),
  orderCache: createCacheWrapper(orderCache, 'order'),
  
  // Cache key generators
  keys: {
    product: (id) => `product:${id}`,
    productList: (query) => `products:${JSON.stringify(query)}`,
    user: (id) => `user:${id}`,
    cart: (userId) => `cart:${userId}`,
    order: (id) => `order:${id}`,
    orderList: (userId, filters) => `orders:${userId}:${JSON.stringify(filters)}`
  },
  
  // Cache invalidation helpers
  invalidate: {
    product: (id) => {
      productCache.del(`product:${id}`);
      // Clear related product list caches
      productCache.keys().forEach(key => {
        if (key.startsWith('products:')) {
          productCache.del(key);
        }
      });
    },
    
    user: (id) => {
      userCache.del(`user:${id}`);
    },
    
    cart: (userId) => {
      cartCache.del(`cart:${userId}`);
    },
    
    order: (id, userId) => {
      orderCache.del(`order:${id}`);
      // Clear user's order list cache
      orderCache.keys().forEach(key => {
        if (key.startsWith(`orders:${userId}:`)) {
          orderCache.del(key);
        }
      });
    }
  },
  
  // Get cache statistics
  getStats: () => ({
    ...cacheStats,
    caches: {
      product: productCache.getStats(),
      user: userCache.getStats(),
      cart: cartCache.getStats(),
      order: orderCache.getStats()
    }
  }),
  
  // Clear all caches
  flushAll: () => {
    productCache.flushAll();
    userCache.flushAll();
    cartCache.flushAll();
    orderCache.flushAll();
    console.log('All caches cleared');
  }
};
