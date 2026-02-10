import { useCallback, useEffect, useState } from 'react';
import { fetchGameMetadata } from '../actions/metadata';
import type { GameMetadata, MetadataCache } from '../types/metadata';

const CACHE_KEY = 'ps2manager_metadata_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const loadCache = (): MetadataCache => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const parsed = JSON.parse(cached) as MetadataCache;

    // Filter out expired entries
    const now = Date.now();
    const filtered: MetadataCache = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (now - value.fetchedAt < CACHE_DURATION) {
        filtered[key] = value;
      }
    }

    return filtered;
  } catch (error) {
    console.error('Failed to load metadata cache:', error);
    return {};
  }
};

const saveCache = (cache: MetadataCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save metadata cache:', error);
  }
};

export const useGameMetadata = () => {
  const [cache, setCache] = useState<MetadataCache>(loadCache);

  // Save cache whenever it changes
  useEffect(() => {
    saveCache(cache);
  }, [cache]);

  const getMetadata = useCallback(
    async (gameTitle: string, gameId?: string): Promise<GameMetadata> => {
      // Check cache first
      const cached = cache[gameTitle];
      const now = Date.now();

      if (cached && now - cached.fetchedAt < CACHE_DURATION) {
        console.log('Using cached metadata for:', gameTitle);
        return cached.metadata;
      }

      // Fetch fresh data
      console.log('Fetching fresh metadata for:', gameTitle);
      const metadata = await fetchGameMetadata(gameTitle, gameId);

      // Update cache
      setCache((prev) => ({
        ...prev,
        [gameTitle]: {
          metadata,
          fetchedAt: now,
        },
      }));

      return metadata;
    },
    [cache],
  );

  const getCachedMetadata = useCallback(
    (gameTitle: string): GameMetadata | null => {
      const cached = cache[gameTitle];
      const now = Date.now();

      if (cached && now - cached.fetchedAt < CACHE_DURATION) {
        return cached.metadata;
      }

      return null;
    },
    [cache],
  );

  const clearCache = useCallback(() => {
    setCache({});
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Object.keys(cache).length;
    const totalSize = JSON.stringify(cache).length;

    return {
      entries,
      size: totalSize,
      sizeKB: (totalSize / 1024).toFixed(2),
    };
  }, [cache]);

  return {
    getMetadata,
    getCachedMetadata,
    clearCache,
    getCacheStats,
    cacheSize: Object.keys(cache).length,
  };
};
