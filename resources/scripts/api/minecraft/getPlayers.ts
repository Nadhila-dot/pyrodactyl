import axios from "axios";

export interface PlayerInfo {
  name: string;
  uuid: string;
}

export interface PlayersData {
  online: number;
  max: number;
  list?: PlayerInfo[];
}

export interface ServerStatusResponse {
  hostname: string;
  players: PlayersData;
  info?: string[];
  online: boolean;
  error?: string;
}

/**
 * Fetches player and server information from a Minecraft server using mcstatus.io API
 * 
 * @param serverIp - The IP address or domain of the Minecraft server
 * @param port - Optional port number (default: 25565)
 * @returns Promise resolving to server status data including hostname, players, and info
 */
export async function getServerStatus(serverIp: string, port: number = 25565): Promise<ServerStatusResponse> {
  try {
    if (!serverIp) throw new Error("Server IP or domain is required");

    const endpoint = `https://api.mcstatus.io/v2/status/java/${serverIp}${port !== 25565 ? `:${port}` : ""}`;
    const response = await axios.get(endpoint, {
      headers: {
        "User-Agent": "pyrodactyl/1.0"
      },
      validateStatus: () => true // Accept all status codes for custom handling
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;
    // Debug log for raw API response
    console.log("Raw mcstatus.io response:", data);

    return {
      hostname: data.host || serverIp,
      players: {
        online: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
        list: Array.isArray(data.players?.list)
          ? data.players.list.map((player: any) => ({
              name: player.name_clean || player.name,
              uuid: player.uuid
            }))
          : []
      },
      info: Array.isArray(data.motd?.clean) ? data.motd.clean : [],
      online: data.online === true
    };
  } catch (error: any) {
    console.error("Error fetching Minecraft server status:", error);
    return {
      hostname: serverIp,
      players: { online: 0, max: 0, list: [] },
      online: false,
      error: error?.message || "Unknown error occurred"
    };
  }
}

/**
 * Fetch just player information from a Minecraft server
 * 
 * @param serverIp - The IP address or domain of the Minecraft server
 * @param port - Optional port number (default: 25565)
 * @returns Promise resolving to players data or null if server is offline
 */
export async function getPlayers(serverIp: string, port: number = 25565): Promise<PlayersData | null> {
  const serverStatus = await getServerStatus(serverIp, port);
  console.log("getPlayers result:", serverStatus.players);
  if (!serverStatus.online) return null;
  return serverStatus.players;
}

export default getServerStatus;