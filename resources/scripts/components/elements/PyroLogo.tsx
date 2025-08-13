import React from 'react';
import CacheWrapper from '@/cache';

const fetchLogoData = async () => {
    const res = await fetch('/nadhi/logo');
    const data = await res.json();
    return {
        logoUrl: data.logo || '/images/default-logo.png',
        companyName: window.company?.name || 'Panel',
    };
};

const PyroLogo = () => {
    return (
        <CacheWrapper cacheKey="pyroLogo" fetchData={fetchLogoData} refreshInterval={60000}>
            {(data) => (
                <div className="flex items-center space-x-3">
                    <img
                        src={data?.logoUrl || '/images/default-logo.png'} // Use cached or fresh logo URL
                        alt={`${data?.companyName || 'Panel'} logo`}
                        className="h-10 w-auto"
                    />
                    <span className="text-white text-xl font-bold">{data?.companyName || 'Panel'}</span>
                </div>
            )}
        </CacheWrapper>
    );
};

export default PyroLogo;