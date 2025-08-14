import { useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { toast } from 'sonner';

const INDEX_KEY = '__cache_index_v1';

const CacheBox = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPlayers, setShowPlayers] = useState(() => localStorage.getItem('player_mc') !== 'false'); // Default to true if not set

    const togglePlayerVisibility = () => {
        setIsSubmitting(true);
        const newValue = !showPlayers;
        setShowPlayers(newValue);
        localStorage.setItem('player_mc', newValue ? 'true' : 'false');
        toast.success(`Player visibility ${newValue ? 'enabled' : 'disabled'}!`);
        setTimeout(() => {
            setIsSubmitting(false);
        }, 50);
        window.location.reload(); // Reload the page to apply changes
    };

    const clearCacheAndReload = () => {
        setIsSubmitting(true);
        try {
            const rawIndex = localStorage.getItem(INDEX_KEY);
            if (rawIndex) {
                try {
                    const index: Record<string, number> = JSON.parse(rawIndex);
                    Object.keys(index).forEach((k) => {
                        try {
                            localStorage.removeItem(k);
                        } catch {
                            /* ignore per-entry removal errors */
                        }
                    });
                } catch {
                    /* if parsing fails, fall back to removing nothing */
                }
            }

            // Always attempt to remove the index key itself
            try {
                localStorage.removeItem(INDEX_KEY);
            } catch {
                /* ignore */
            }

            toast.success('Cache cleared. Reloading...');
            // small delay so spinner/toast render before reload
            setTimeout(() => {
                setIsSubmitting(false);
                window.location.reload();
            }, 120);
        } catch (err) {
            console.error('Failed to clear cache index:', err);
            toast.error('Failed to clear cache.');
            setIsSubmitting(false);
        }
    };

    return (
        <ContentBox>
            <SpinnerOverlay visible={isSubmitting} />
            <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Clear Cache</h3>
                        <p className="text-sm text-gray-500">
                            Clear all cached entries (using the cache index) and reload the page.
                        </p>
                    </div>
                    <Button
                        onClick={clearCacheAndReload}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-full bg-red-500 text-white"
                    >
                        Clear Cache & Reload
                    </Button>
                </div>
            </div>
        </ContentBox>
    );
};

CacheBox.displayName = 'CacheBox';
export default CacheBox;