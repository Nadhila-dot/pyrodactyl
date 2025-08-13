import { useState, useEffect } from 'react';

const cache: Record<string, { value: any; timestamp: number }> = {};

interface CacheOptions {
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number; // Time-to-live in milliseconds
}

export const useCachedValue = ({ key, fetcher, ttl = 60000 }: CacheOptions) => {
    const [data, setData] = useState<any>(cache[key]?.value || null);
    const [loading, setLoading] = useState(!cache[key]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
                // Use cached data if it's still valid
                setData(cache[key].value);
                setLoading(false);
            } else if (!cache[key] || Date.now() - cache[key].timestamp >= ttl) {
                // Fetch new data if cache is expired or doesn't exist
                setLoading(true);
                try {
                    const result = await fetcher();
                    if (isMounted) {
                        cache[key] = { value: result, timestamp: Date.now() };
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