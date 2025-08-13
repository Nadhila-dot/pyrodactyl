import React, { useEffect, useState, useCallback } from 'react';

const refreshCallbacks: Record<string, () => void> = {};

export const useRefresh = (key: string) => {
    const triggerRefresh = useCallback(() => {
        if (refreshCallbacks[key]) {
            refreshCallbacks[key]();
        }
    }, [key]);

    return triggerRefresh;
};

interface CacheWrapperProps {
    cacheKey: string; // Unique key for the cache
    refreshInterval?: number; // Refresh interval in milliseconds
    fetchData: () => Promise<any>; // Function to fetch fresh data
    children: (data: any) => React.ReactNode; // Render prop to pass cached or fresh data
}

const CacheWrapper: React.FC<CacheWrapperProps> = ({ cacheKey, refreshInterval, fetchData, children }) => {
    const [data, setData] = useState<any>(() => {
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : null; // Use cached data if available
    });

    const refreshData = useCallback(async () => {
        try {
            const freshData = await fetchData();
            setData(freshData);
            localStorage.setItem(cacheKey, JSON.stringify(freshData)); // Update cache
        } catch (error) {
            console.error(`Failed to fetch data for cacheKey: ${cacheKey}`, error);
        }
    }, [cacheKey, fetchData]);

    useEffect(() => {
        refreshCallbacks[cacheKey] = refreshData;

        refreshData(); // Fetch fresh data on mount

        if (refreshInterval) {
            const interval = setInterval(refreshData, refreshInterval);
            return () => {
                clearInterval(interval);
                delete refreshCallbacks[cacheKey];
            };
        }

        return () => {
            delete refreshCallbacks[cacheKey];
        };
    }, [cacheKey, refreshInterval, refreshData]);

    return <>{children(data)}</>;
};

export default CacheWrapper;