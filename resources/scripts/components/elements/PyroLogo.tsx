import http from '@/api/http';
import React, { useEffect, useState } from 'react';

const Logo = () => {
    const [logoUrl, setLogoUrl] = useState('/images/default-logo.png');

    useEffect(() => {
        http.get('/api/client/logo')
            .then(res => {
                if (res.data.logo) setLogoUrl(res.data.logo);
            })
            .catch(() => {
                setLogoUrl('/images/default-logo.png');
            });
    }, []);

    return (
        <div className="flex items-center space-x-3">
            <img
                src={logoUrl}
                alt="Creepercloud logo"
                className="h-10 w-auto"
            />
            <span className="text-white text-xl font-bold">Creepercloud</span>
        </div>
    );
};

export default Logo;