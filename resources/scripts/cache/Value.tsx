import { useState, useEffect } from 'react';

const cache: Record<string, { value: any; timestamp: number }> = {};

interface CacheOptions {
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number; // Time-to-live in milliseconds
}

export const useCachedValue = ({ key, fetcher, ttl = 60000 }: CacheOptions) => {
    const [data, setData] = useState<any>(() => {
        // Check localStorage for cached data
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < ttl) {
                cache[key] = parsed; // Sync with in-memory cache
                return parsed.value;
            }
        }
        return cache[key]?.value || null;
    });

    const [loading, setLoading] = useState(!data);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
                // Use cached data if it's still valid
                setData(cache[key].value);
                setLoading(false);
            } else {
                // Fetch new data if cache is expired or doesn't exist
                setLoading(true);
                try {
                    const result = await fetcher();
                    if (isMounted) {
                        const cachedData = { value: result, timestamp: Date.now() };
                        cache[key] = cachedData;
                        localStorage.setItem(key, JSON.stringify(cachedData)); // Save to localStorage
                        setData(result);
                    }
                } catch (error) {
                    console.error(`Failed to fetch data for key "${key}":`, error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Prevent state updates if the component unmounts
        };
    }, [key, fetcher, ttl]);

    return { data, loading };
};