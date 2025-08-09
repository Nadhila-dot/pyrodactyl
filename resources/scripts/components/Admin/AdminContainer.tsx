import { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { Navigate } from 'react-router-dom';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

const AdminContainer = () => {
    const rootAdmin = useStoreState((state) => state.user.data?.rootAdmin);
    const user = useStoreState((state) => state.user.data);

    // If we're still loading user data, show a spinner
    if (!user) {
        return <SpinnerOverlay visible={true} />;
    }

    // If user is an admin, redirect to admin panel
    if (rootAdmin) {
        window.location.href = '/admin';
        return (
            <>
                <SpinnerOverlay visible={true} />
                <div className="text-center text-white mt-2">Fetching Admin</div>
            </>
        )
    }

    // If user is not an admin, redirect to dashboard
    return (
        <>
        <SpinnerOverlay visible={true} />
        <div className="text-center text-white mt-2">Oops! you don't have enough permissions</div>
        </>
    )
};

export default AdminContainer;