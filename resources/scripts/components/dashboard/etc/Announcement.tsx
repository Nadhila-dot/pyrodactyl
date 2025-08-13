wrong this is the original annoucement thing

import React, { useEffect, useState } from 'react';

import HugeIconsAlert from '@/components/elements/hugeicons/Alert';
import clsx from 'clsx';
import Spinner from '@/components/elements/Spinner';
import http from '@/api/http';

interface AnnouncementData {
    icon?: string;
    title?: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
}

export const Announcement = () => {
    const [data, setData] = useState<AnnouncementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await http.get('/api/client/announcement');
                setData({
                    ...data,
                    type: (data.type || 'info') as 'info' | 'warning' | 'danger'
                });
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
                setError('Failed to load announcement. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncement();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Spinner size="small" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center border-l-8 border-red-500 bg-red-500/25 text-zinc-50 rounded-md shadow-sm px-4 py-3">
                <HugeIconsAlert fill="currentColor" className="w-6 h-6 text-red-400 mr-2" />
                <div>{error}</div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const getAlertStyles = () => {
        switch (data.type) {
            case 'danger':
                return {
                    border: 'border-red-500 bg-red-500/25',
                    icon: <HugeIconsAlert fill="currentColor" className="w-6 h-6 text-red-400 mr-3" />
                };
            case 'warning':
                return {
                    border: 'border-yellow-500 bg-yellow-500/25',
                    icon: <HugeIconsAlert fill="currentColor" className="w-6 h-6 text-yellow-500 mr-3" />
                };
            case 'success':
                return {
                    border: 'border-green-500 bg-green-500/25',
                    icon: data.icon || '✅'
                };
            case 'info':
            default:
                return {
                    border: 'border-blue-500 bg-blue-500/25',
                    icon: data.icon || 'ℹ️'
                };
        }
    };

    const { border, icon } = getAlertStyles();

    return (
        <div className={clsx(
            'flex items-start border-l-8 text-zinc-50 rounded-md shadow-sm px-4 py-3 mb-4 font-[Poppins]',
            border
        )}>
            <div className="flex-shrink-0 mr-3 text-2xl">
                {typeof icon === 'string' ? icon : React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <div className="flex-1 ">
                {data.title && (
                    <h3 className="text-2xl font-medium">
                        {data.title}
                    </h3>
                )}
                {data.description && (
                    <div className="mt-1 text-sm">
                        {data.description}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcement;


