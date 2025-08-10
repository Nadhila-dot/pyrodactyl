import http from '@/api/http';
import React, { useEffect, useState } from 'react';

const Logo = () => {
    const [logoUrl, setLogoUrl] = useState('/images/default-logo.png');
    const [companyName, setCompanyName] = useState('Panel');

    useEffect(() => {
        http.get('/nadhi/logo')
            .then(res => {
                if (res.data.logo) setLogoUrl(res.data.logo);
            })
            .catch(() => {
                setLogoUrl('/images/default-logo.png');
            });

        // Get company name from global window object
        if (window.company && window.company.name) {
            setCompanyName(window.company.name);
        }
    }, []);

    return (
        <div className="flex items-center space-x-3">
            <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="h-10 w-auto"
            />
            <span className="text-white text-xl font-bold">{companyName}</span>
        </div>
    );
};

export default Logo;