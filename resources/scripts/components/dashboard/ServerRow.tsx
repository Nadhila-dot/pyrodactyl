"use client"

import type React from "react"

import { Fragment, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { bytesToString, ip } from "@/lib/formatters"
import type { Server } from "@/api/server/getServer"
import getServerResourceUsage, { type ServerStats } from "@/api/server/getServerResourceUsage"
import { getPlayers } from "@/api/minecraft/getPlayers"
import { Badge } from "../ui/badge"
import { IconUser } from "@tabler/icons-react"
//import type { PlayersData } from "@/api/minecraft/getPlayers"; // <-- import the type

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9

type Timer = ReturnType<typeof setInterval>

const ServerRow = ({ server, className }: { server: Server; className?: string }) => {
  const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>
  const [isSuspended, setIsSuspended] = useState(server.status === "suspended")
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [players, setPlayers] = useState<any | null>(null)

  const getStats = () =>
    getServerResourceUsage(server.uuid)
      .then((data) => setStats(data))
      .catch((error) => console.error(error))

  useEffect(() => {
    setIsSuspended(stats?.isSuspended || server.status === "suspended")
  }, [stats?.isSuspended, server.status])

  useEffect(() => {
    // Don't waste a HTTP request if there is nothing important to show to the user because
    // the server is suspended.
    // nadhi - Oh you fucking thing your amazing for this ryt? cunty bitch
    if (isSuspended) return

    getStats().then(() => {
      interval.current = setInterval(() => getStats(), 30000)
    })

    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [isSuspended])

  useEffect(() => {
    if (!isSuspended && server.allocations.length > 0) {
      const allocation = server.allocations.find(a => a.isDefault);
      if (allocation) {
        const ipToUse = allocation.alias || allocation.ip;
        getPlayers(ipToUse, allocation.port)
          .then((data) => {
            console.log("Players object for server", server.name, data);
            setPlayers(data);
          })
          .catch(() => setPlayers(null));
      }
    } else {
      setPlayers(null);
      console.warn("Skipping player fetch: server is suspended or has no default allocation.");
    }
  }, [isSuspended, server.allocations]);

  const alarms = { cpu: false, memory: false, disk: false }
  if (stats) {
    alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9
    alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory)
    alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk)
  }

  const getStatusColor = () => {
    if (!stats?.status || stats.status === "offline") return "red"
    if (stats.status === "running") return "emerald"
    return "yellow"
  }

  const statusColor = getStatusColor()
  const isRunning = stats?.status === "running"

  return (
    <Link
      to={`/server/${server.id}`}
      className={`
        block bg-black border border-emerald-500/20 rounded-xl p-6 
        transition-all duration-300 ease-in-out cursor-pointer
        hover:border-emerald-500/20 hover:bg-white/5
        ${isRunning ? "hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10" : ""}
        ${isRunning ? "border-l-4 border-l-emerald-500" : ""}
        ${className || ""}
      `}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Server info */}
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="relative">
            <div
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${statusColor === "emerald" ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : ""}
                ${statusColor === "red" ? "bg-red-500 shadow-lg shadow-red-500/50" : ""}
                ${statusColor === "yellow" ? "bg-yellow-500 shadow-lg shadow-yellow-500/50" : ""}
              `}
            />
            {isRunning && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-20" />
            )}
          </div>

          {/* Server details */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold tracking-tight ${isRunning ? "text-white" : "text-white/80"}`}>
                {server.name}
              </h3>
            </div>
            <p className={`text-sm ${isRunning ? "text-white/60" : "text-white/40"}`}>
              {server.allocations
                .filter((alloc) => alloc.isDefault)
                .map((allocation) => (
                  <Fragment key={allocation.ip + allocation.port.toString()}>
                    {(allocation.alias || allocation.alias || ip(allocation.ip))}:{allocation.port}
                  </Fragment>
                ))}
            </p>

            {/* Player badges and count */}
            {players && typeof players.online === "number" && typeof players.max === "number" && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className="flex items-center gap-1">
                  <IconUser />
                  <span className="ml-1 text-xs text-white/70 font-semibold">
                    Players on your server {players.online} / {players.max}
                  </span>
                </Badge>
                {Array.isArray(players.list) && players.list.length > 0 && (
                  <div className="flex flex-wrap gap-1">
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
            )}
          </div>
        </div>

        {/* Right side - Stats */}
        <div
          className={`
          hidden sm:flex items-center gap-6 px-4 py-2 rounded-lg border
          ${isRunning ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/10"}
        `}
        >
          {!stats || isSuspended ? (
            <div className="text-center">
              {isSuspended ? (
                <span className="text-red-400 text-sm font-medium">
                  {server.status === "suspended" ? "Suspended" : "Connection Error"}
                </span>
              ) : server.isTransferring || server.status ? (
                <span className="text-white/60 text-sm font-medium">
                  {server.isTransferring
                    ? "Transferring"
                    : server.status === "installing"
                      ? "Installing"
                      : server.status === "restoring_backup"
                        ? "Restoring Backup"
                        : "Unavailable"}
                </span>
              ) : (
                <span className="text-white/40 text-sm">Catching bytes!</span>
              )}
            </div>
          ) : (
            <>
              {/* CPU Usage */}
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium ${isRunning ? "text-white/60" : "text-white/40"}`}>CPU</span>
                <span
                  className={`text-sm font-semibold ${alarms.cpu ? "text-red-400" : isRunning ? "text-white" : "text-white/80"
                    }`}
                >
                  {stats.cpuUsagePercent.toFixed(1)}%
                </span>
              </div>

              {/* Memory Usage */}
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium ${isRunning ? "text-white/60" : "text-white/40"}`}>RAM</span>
                <span
                  className={`text-sm font-semibold ${alarms.memory ? "text-red-400" : isRunning ? "text-white" : "text-white/80"
                    }`}
                >
                  {bytesToString(stats.memoryUsageInBytes, 0)}
                </span>
              </div>

              {/* Disk Usage */}
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium ${isRunning ? "text-white/60" : "text-white/40"}`}>Storage</span>
                <span
                  className={`text-sm font-semibold ${alarms.disk ? "text-red-400" : isRunning ? "text-white" : "text-white/80"
                    }`}
                >
                  {bytesToString(stats.diskUsageInBytes, 0)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ServerRow
