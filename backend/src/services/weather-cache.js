// Weather data caching service with TTL
class WeatherCache {
  constructor() {
    this.cache = new Map();
    this.TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
  }

  getKey(lat, lon) {
    // Round coordinates to 2 decimal places for cache efficiency
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    return `${roundedLat},${roundedLon}`;
  }

  get(lat, lon) {
    const key = this.getKey(lat, lon);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(lat, lon, data) {
    const key = this.getKey(lat, lon);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const weatherCache = new WeatherCache();

// Clean expired entries every 10 minutes
setInterval(() => {
  weatherCache.cleanup();
}, 10 * 60 * 1000);

module.exports = weatherCache;