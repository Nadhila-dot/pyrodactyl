import { useEffect, useState } from 'react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import { ServerContext } from '@/state/server';
import MinecraftPluginContainer from './MinecraftContainer';
import Button from '@/components/elements/button/Button';
import FACTORIO from '@/assets/images/factorio.webp';

const GAME_OPTIONS = [
    {
        key: 'minecraft',
        name: 'Minecraft',
        icon: 'https://cdn.worldvectorlogo.com/logos/minecraft-launcher.svg',
        description: 'Manage plugins and mods for your Minecraft server.',
    },
    {
        key: 'CS:GO',
        name: 'CS:GO',
        icon: 'https://cdn.worldvectorlogo.com/logos/csgo-4.svg',
        description: 'Add and configure SourceMod plugins for CS:GO.',
    },
    {
        key: 'factorio',
        name: 'Factorio',
        icon: FACTORIO,
        description: 'Automate and expand with Factorio mods.',
    },
];

function getLocalGame(uuid: string): string | null {
    try {
        const key = `creeper_selected_game_${uuid}`;
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function setLocalGame(uuid: string, game: string) {
    try {
        const key = `creeper_selected_game_${uuid}`;
        localStorage.setItem(key, game);
    } catch {
        // ignore errors
    }
}

const PluginContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [showGameSelect, setShowGameSelect] = useState(false);

    useEffect(() => {
        const saved = getLocalGame(uuid);
        if (saved) {
            setSelectedGame(saved);
        } else {
            setShowGameSelect(true);
        }
    }, [uuid]);

    const handleGameSelect = (game: string) => {
        setSelectedGame(game);
        setLocalGame(uuid, game);
        setShowGameSelect(false);
    };

    // Immediately return the selected game's container, nothing else
    if (selectedGame === 'minecraft') {
        return <MinecraftPluginContainer />;
    }
    if (selectedGame === 'source') {
        return (
            <div className="text-center text-zinc-400 py-12">CS:GO Addons coming soon.</div>
        );
    }
    if (selectedGame === 'factorio') {
        return (
            <div className="text-center text-zinc-400 py-12">Factorio Addons coming soon.</div>
        );
    }

    return (
        <ServerContentBlock title={'Addons'}>
            <MainPageHeader title={'Addons'}>
                {selectedGame && (
                    <span className="ml-2 px-3 py-1 rounded bg-zinc-900 border border-emerald-500 text-emerald-400 text-xs backdrop-blur-xs font-semibold">
                        {GAME_OPTIONS.find(opt => opt.key === selectedGame)?.name || selectedGame}
                    </span>
                )}
            </MainPageHeader>
            {showGameSelect && (
                <div className="mb-8 text-center w-full flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-white mb-2">Choose Game</h2>
                    <p className="text-zinc-400 text-base max-w-md">
                        Select the game for which you want to view and manage addons/plugins.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12 w-full max-w-5xl">
                        {GAME_OPTIONS.map(opt => (
                            <div
                                key={opt.key}
                                className="flex flex-col items-center justify-center bg-black border border-emerald-500/30 rounded-xl shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:border-emerald-500 hover:shadow-emerald-500/20"
                            >
                                <img
                                    src={opt.icon}
                                    alt={opt.name}
                                    className="w-24 h-24 mt-8 mb-4 rounded-lg object-cover mx-auto bg-[#222] p-2"
                                />
                                <span className="font-bold text-xl text-white text-center mb-2">{opt.name}</span>
                                <span className="text-zinc-400 text-sm text-center mb-6 px-4">{opt.description}</span>
                                <Button
                                    className="w-32 mb-8"
                                    onClick={() => handleGameSelect(opt.key)}
                                    size="large"
                                >
                                    Select
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ServerContentBlock>
    );
};

export default PluginContainer;