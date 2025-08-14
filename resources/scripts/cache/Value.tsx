import { useState, useEffect } from 'react';

const cache: Record<string, { value: any; timestamp: number }> = {};
const failedKeys: Set<string> = new Set(); // Track keys with failed API calls
const INDEX_KEY = '__cache_index_v1';

interface CacheOptions {
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number; // Time-to-live in milliseconds
}

const safeGetLocal = (k: string) => {
    try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
    } catch {
        return null;
    }
};

const safeSetLocal = (k: string, v: string) => {
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
    } catch {
        /* ignore */
    }
};

const readIndex = (): Record<string, number> => {
    const raw = safeGetLocal(INDEX_KEY);
    if (!raw) return {};
    try {
        return JSON.parse(raw) as Record<string, number>;
    } catch {
        return {};
    }
};

const writeIndex = (index: Record<string, number>) => {
    safeSetLocal(INDEX_KEY, JSON.stringify(index));
};

const addToIndex = (key: string, timestamp: number) => {
    const index = readIndex();
    index[key] = timestamp;
    writeIndex(index);
};

export const useCachedValue = ({ key, fetcher, ttl = 60000 }: CacheOptions) => {
    const [data, setData] = useState<any>(() => {
        try {
            const stored = safeGetLocal(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < ttl) {
                    cache[key] = parsed; // Sync with in-memory cache
                    // ensure index contains this key
                    addToIndex(key, parsed.timestamp);
                    return parsed.value;
                }
            }
        } catch {
            /* ignore */
        }
        return cache[key]?.value || null;
    });

    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState<string | null>(null); // Track error state

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (failedKeys.has(key)) {
                // If the key is marked as failed, do not retry
                setLoading(false);
                setError('Failed to fetch data previously.');
                return;
            }

            if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
                // Use cached data if it's still valid
                setData(cache[key].value);
                setLoading(false);
                return;
            }

            // Attempt to load from localStorage index/entry before fetching
            try {
                const stored = safeGetLocal(key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Date.now() - parsed.timestamp < ttl) {
                        cache[key] = parsed;
                        addToIndex(key, parsed.timestamp);
                        if (isMounted) {
                            setData(parsed.value);
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch {
                /* ignore and continue to fetch */
            }

            // Fetch new data if cache is expired or doesn't exist
            setLoading(true);
            setError(null); // Reset error state before fetching
            try {
                const result = await fetcher();
                if (isMounted) {
                    const cachedData = { value: result, timestamp: Date.now() };
                    cache[key] = cachedData;
                    try {
                        safeSetLocal(key, JSON.stringify(cachedData)); // Save entry
                        addToIndex(key, cachedData.timestamp); // Save/update index
                    } catch {
                        /* ignore storage errors */
                    }
                    setData(result);
                }
            } catch (error) {
                console.error(`Failed to fetch data for key "${key}":`, error);
                failedKeys.add(key); // Mark the key as failed
                if (isMounted) setError(error instanceof Error ? error.message : 'Unknown error occurred.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Prevent state updates if the component unmounts
        };
    }, [key, fetcher, ttl]);

    return { data, loading, error }; // Return error state
};