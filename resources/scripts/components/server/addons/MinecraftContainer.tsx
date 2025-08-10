import { For } from 'million/react';
import { useEffect, useState, useCallback } from 'react';
import debounce from 'debounce';

import FlashMessageRender from '@/components/FlashMessageRender';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer, PageListItem } from '@/components/elements/pages/PageList';
import getPlugins from '@/api/server/plugins/getPlugins';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import PluginBlock from './PluginBlock';
import Spinner from '@/components/elements/Spinner';
import EmptyStateSvg from '@/assets/images/empty.svg';
import ChangeButton from './ChangeButton';

const MinecraftPluginContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [plugins, setPlugins] = useState<any[]>([]);
    const [search, setSearch] = useState('Creepercloud');

    // Debounced fetch function
    const fetchPlugins = useCallback(
        debounce((query: string) => {
            setLoading(true);
            clearFlashes('plugins');
            getPlugins(uuid, query)
                .then((data) => setPlugins(data.plugins || []))
                .catch((error) => {
                    console.error(error);
                    addError({ key: 'plugins', message: 'Failed to load plugins.' });
                })
                .finally(() => setLoading(false));
        }, 400),
        [uuid]
    );

    useEffect(() => {
        fetchPlugins(search);
        // Cancel debounce on unmount
        return () => fetchPlugins.clear();
    }, [search, uuid, fetchPlugins]);

    return (
        <ServerContentBlock title={'Minecraft Plugins'}>
            <FlashMessageRender byKey={'plugins'} />
            <MainPageHeader title={'Minecraft Plugins'} />
            <div className="mb-4 flex items-center gap-2">
                <input
                    type="text"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Search Minecraft plugins..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className=" rounded-lg ">
                    <ChangeButton/>
                    
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Spinner size="large" centered />
                </div>
            ) : (
                <>
                    {plugins.length > 0 ? (
                        <PageListContainer className='!bg-transparent '>
                            <For each={plugins} memo>
                                {(plugin, index) => (
                                    <PageListItem key={index} className="mb-4 px-4 ">
                                        <PluginBlock plugin={plugin} />
                                    </PageListItem>
                                )}
                            </For>
                        </PageListContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <img
                                src={EmptyStateSvg}
                                alt="No plugins"
                                className="w-48 h-48 mb-4 text-white opacity-100 bg-zinc-400 rounded-lg"
                            />
                            <p className="text-center text-sm text-zinc-400">
                                No Minecraft plugins found. Try searching for a specific plugin or check your server configuration.
                            </p>
                        </div>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};

export default MinecraftPluginContainer;