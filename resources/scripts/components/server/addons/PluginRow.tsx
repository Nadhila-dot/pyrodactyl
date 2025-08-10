import { useEffect, useState } from 'react';
import getPlugins, { Plugin } from '@/api/server/plugins/getPlugins';
import { ServerContext } from '@/state/server';
import PluginBlock from './PluginBlock';

/**
 * Depreacted
 * 
 * This component is used to display a list of plugins for a server.
 * 
 */

const PluginRow = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [plugins, setPlugins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPlugins(uuid, '').then((data: Plugin) => {
            setPlugins(data.plugins || []);
            setLoading(false);
        }).catch((err) => {
            console.error('Failed to fetch plugins:', err);
            setLoading(false);
        });
    }, [uuid]);

    if (loading) {
        return <div className="text-center text-zinc-400">Loading plugins...</div>;
    }

    if (plugins.length === 0) {
        return <div className="text-center text-zinc-400">No plugins found.</div>;
    }

    return (
        <div className="grid gap-4">
            {plugins.map((plugin) => (
                <div className='py-3'>
                    <PluginBlock key={plugin.id} plugin={plugin} />
                </div>
            ))}
        </div>
    );
};

export default PluginRow;