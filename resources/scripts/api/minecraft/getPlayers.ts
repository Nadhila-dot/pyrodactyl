interface PlayerInfo {
  name: string;
  uuid: string;
}

interface PlayersData {
  online: number;
  max: number;
  list?: PlayerInfo[];
}

interface ServerStatusResponse {
  hostname: string;
  players: PlayersData;
  info?: string[];
  online: boolean;
  error?: string;
}

/**
 * Fetches player and server information from a Minecraft server using mcsrvstat.us API
 * 
 * @param serverIp - The IP address or domain of the Minecraft server
 * @param port - Optional port number (default: 25565)
 * @returns Promise resolving to server status data including hostname, players, and info
 */
export async function getServerStatus(serverIp: string, port: number = 25565): Promise<ServerStatusResponse> {
  try {
    // Make sure we have a proper IP/domain
    if (!serverIp) {
      throw new Error('Server IP or domain is required');
    }
    
    const endpoint = `https://api.mcsrvstat.us/2/${serverIp}${port !== 25565 ? `:${port}` : ''}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Contava/Nadhi.dev (If we are hindering usage, please contact us nadhilaplayz@gmail.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access forbidden. A proper User-Agent header is required.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response to match our expected output
    return {
      hostname: data.hostname || data.ip || serverIp,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0,
        list: data.players?.list || []
      },
      info: data.motd?.clean || data.motd?.html || [],
      online: data.online === true
    };
  } catch (error) {
    console.error('Error fetching Minecraft server status:', error);
    return {
      hostname: serverIp,
      players: { online: 0, max: 0 },
      online: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
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
  
  if (!serverStatus.online) {
    return null;
  }
  
  return serverStatus.players;
}

export default getServerStatus;