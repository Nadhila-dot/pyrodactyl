import { Badge } from "@/components/ui/badge";
import { IconUser } from "@tabler/icons-react";
import { useCachedValue } from "@/cache/Value";
import type { PlayersData } from "@/api/minecraft/getPlayers";
import { getPlayers } from "@/api/minecraft/getPlayers";
import { ServerContext } from "@/state/server";

const ServerPlayers = () => {
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations);

    // Cache players data
    const { data: players, loading } = useCachedValue({
        key: "server-players",
        fetcher: async () => {
            const allocation = allocations.find((a) => a.isDefault);
            if (!allocation) return null;
            const ipToUse = allocation.alias || allocation.ip;
            return getPlayers(ipToUse, allocation.port);
        },
        ttl: 60000, // Cache for 60 seconds
    });

    if (loading || !players || typeof players.online !== "number" || typeof players.max !== "number") return null;

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
                    {players.list.map((player) => (
                        <span
                            key={player.uuid} // Use the player's UUID as the key
                            className="bg-emerald-700/80 text-white text-xs px-2 py-1 rounded-full font-medium"
                            title={player.uuid} // Use the player's UUID for the title
                        >
                            {player.name} {/* Display the player's name */}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServerPlayers;