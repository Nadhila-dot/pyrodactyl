import { useEffect, useState } from "react";
import { getPlayers } from "@/api/minecraft/getPlayers";
import { Badge } from "@/components/ui/badge";
import { IconUser } from "@tabler/icons-react";
import type { PlayersData } from "@/api/minecraft/getPlayers";
import { ServerContext } from "@/state/server";

const ServerPlayers = () => {
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations);
    const [players, setPlayers] = useState<PlayersData | null>(null);

    useEffect(() => {
        const allocation = allocations.find(a => a.isDefault);
        if (allocation) {
            const ipToUse = allocation.alias || allocation.ip;
            getPlayers(ipToUse, allocation.port)
                .then((data) => {
                    console.log("Players object for console", ipToUse, allocation.port, data);
                    setPlayers(data);
                })
                .catch(() => setPlayers(null));
        }
    }, [allocations]);

    if (!players || typeof players.online !== "number" || typeof players.max !== "number") return null;

    return (
        <div className="mt-2">
            <Badge className="flex items-center gap-1">
                <IconUser />
                <span className="ml-1 text-xs text-white/70 font-semibold">
                    Players online: {players.online} / {players.max}
                </span>
            </Badge>
            {Array.isArray(players.list) && players.list.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {players.list.map(player => (
                        <span
                            key={player.uuid}
                            className="bg-emerald-700/80 text-white text-xs px-2 py-1 rounded-full font-medium"
                            title={player.uuid}
                        >
                            {player.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServerPlayers;