import { useState } from 'react';
import installPlugin from '@/api/server/plugins/installPlugins';
import Button from '@/components/elements/button/Button';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';

interface PluginBlockProps {
    plugin: any;
}

const PluginBlock = ({ plugin }: PluginBlockProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(false);
    const [installed, setInstalled] = useState(false);
    const { addError, clearFlashes } = useFlash();

    const handleInstall = async () => {
        setLoading(true);
        clearFlashes('plugins');
        try {
            await installPlugin(uuid, plugin.id);
            setInstalled(true);
        } catch (e) {
            addError({ key: 'plugins', message: 'Failed to install plugin.' });
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-4 rounded-lg p-4 transition-colors w-full">
            <img
                src={plugin.icon?.url ? `https://www.spigotmc.org/${plugin.icon.url}` : 'https://upload.wikimedia.org/wikipedia/it/2/2e/Java_Logo.svg'}
                alt={plugin.name}
                className="w-12 h-12 rounded-lg object-cover"
                loading="lazy"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white truncate">{plugin.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">{plugin.version?.id && `v${plugin.version.id}`}</span>
                </div>
                <p className="text-sm text-zinc-400 truncate">{plugin.tag}</p>
                <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                    <span>Author: {plugin.author?.id}</span>
                    <span>Downloads: {plugin.downloads}</span>
                    <span>Rating: {plugin.rating?.average?.toFixed(1) ?? 'N/A'}</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2 ml-auto">
                <Button
                    size="large"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-3 text-lg font-bold rounded-xl shadow-lg"
                    onClick={handleInstall}
                    disabled={loading || installed}
                >
                    {installed ? 'Installed' : loading ? 'Installing...' : 'Install'}
                </Button>
            </div>
        </div>
    );
};

export default PluginBlock;