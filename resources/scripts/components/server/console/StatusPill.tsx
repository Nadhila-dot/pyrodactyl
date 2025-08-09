import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { ServerContext } from '@/state/server';

const TIMEOUT_DURATION = 9000; // 9 seconds

export const StatusPill = () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const [hasTimedOut, setHasTimedOut] = useState(false);

    useEffect(() => {
        if (status !== 'fetching') {
            setHasTimedOut(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            setHasTimedOut(true);
        }, TIMEOUT_DURATION);

        return () => clearTimeout(timeoutId);
    }, [status]);

    const getStatusConfig = () => {
        if (hasTimedOut) {
            return {
                label: 'Connection Timeout',
                bgClass: 'bg-black/80 border border-rose-500/30',
                dotClass: 'bg-rose-500',
                textClass: 'text-rose-400',
                isLoading: false
            };
        }

        switch (status) {
            case 'offline':
                return {
                    label: 'Offline',
                    bgClass: 'bg-black/80 border border-zinc-700',
                    dotClass: 'bg-zinc-500',
                    textClass: 'text-zinc-400',
                    isLoading: false
                };
            case 'running':
                return {
                    label: 'Online',
                    bgClass: 'bg-emerald-950/70 border border-emerald-500/30',
                    dotClass: 'bg-emerald-400',
                    textClass: 'text-emerald-300',
                    isLoading: false,
                    isActive: true
                };
            case 'starting':
                return {
                    label: 'Starting',
                    bgClass: 'bg-black/80 border border-emerald-500/30',
                    dotClass: 'bg-emerald-500',
                    textClass: 'text-emerald-400',
                    isLoading: true
                };
            case 'stopping':
                return {
                    label: 'Stopping',
                    bgClass: 'bg-black/80 border border-amber-500/30',
                    dotClass: 'bg-amber-500',
                    textClass: 'text-amber-400',
                    isLoading: true
                };
            default: // fetching
                return {
                    label: 'Connecting',
                    bgClass: 'bg-black/80 border border-emerald-500/30',
                    dotClass: 'bg-emerald-500',
                    textClass: 'text-emerald-400',
                    isLoading: true
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={clsx(
            'inline-flex items-center gap-2 px-4 py-1.5',
            'rounded-full border transition-all duration-200 ease-out',
            'shadow-sm hover:shadow-md',
            'backdrop-blur-sm',
            config.bgClass
        )}>
            {/* Status Indicator */}
            {/* Status Indicator */}
<div className="relative flex items-center justify-center w-5 h-5">
    {/* Dot */}
    <div className={clsx(
        'absolute h-2 w-2 rounded-full z-10',
        config.dotClass
    )} />
    
    {/* Pulsing for active state */}
    {config.isActive && (
        <div className="absolute h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-60 z-0" />
    )}
    
    {/* Spinner for loading states */}
    {config.isLoading && (
        <div className="absolute inset-0">
            <div className="h-5 w-5 rounded-full text-emerald-500 border-2 border-transparent border-t-current border-r-current animate-spin opacity-70" 
                 style={{ borderTopColor: config.dotClass, borderRightColor: config.dotClass }} />
        </div>
    )}
</div>

            {/* Status Label */}
            <span className={clsx(
                'text-sm font-medium transition-colors duration-200',
                config.textClass
            )}>
                {config.label}
            </span>
        </div>
    );
};