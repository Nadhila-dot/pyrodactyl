import { useState, useEffect } from 'react';

const cache: Record<string, any> = {};

interface CacheOptions {
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number; // Time-to-live in milliseconds
}

export const useCachedValue = ({ key, fetcher, ttl = 60000 }: CacheOptions) => {
    const [data, setData] = useState<any>(cache[key]?.value || null);
    const [loading, setLoading] = useState(!cache[key]);

    useEffect(() => {
        const fetchData = async () => {
            if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
                setData(cache[key].value);
                setLoading(false);
            } else {
                setLoading(true);
                try {
                    const result = await fetcher();
                    cache[key] = { value: result, timestamp: Date.now() };
                    setData(result);
                } catch (error) {
                    console.error(`Failed to fetch data for key "${key}":`, error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [key, fetcher, ttl]);

    return { data, loading };
};