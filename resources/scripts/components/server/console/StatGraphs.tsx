import { faCloudDownloadAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect, useRef, useState } from 'react';

import ChartBlock from '@/components/server/console/ChartBlock';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { SocketEvent } from '@/components/server/events';

import { bytesToString } from '@/lib/formatters';

import { ServerContext } from '@/state/server';

import useWebsocketEvent from '@/plugins/useWebsocketEvent';

// use recharts cuz everything else is ugly. 
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';

const getAccent = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--main-color')?.trim() || '#10b981';

const StatGraphs = () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    // Store chart data for shadcn charts
    const [cpuData, setCpuData] = useState<{ name: string; value: number }[]>([]);
    const [ramData, setRamData] = useState<{ name: string; value: number }[]>([]);
    const [networkData, setNetworkData] = useState<{ name: string; in: number; out: number }[]>([]);

    const accentColor = getAccent();

    useEffect(() => {
        if (status === 'offline') {
            setCpuData([]);
            setRamData([]);
            setNetworkData([]);
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        setCpuData((prev) => [
            ...prev.slice(-49),
            { name: '', value: values.cpu_absolute },
        ]);
        setRamData((prev) => [
            ...prev.slice(-49),
            { name: '', value: Math.floor(values.memory_bytes / 1024 / 1024) },
        ]);
        setNetworkData((prev) => [
            ...prev.slice(-49),
            {
                name: '',
                in: previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx),
                out: previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx),
            },
        ]);
        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <Tooltip.Provider>
            <div className="transform-gpu skeleton-anim-2" style={{ animationDelay: `250ms` }}>
                <ChartBlock title={'CPU'}>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={cpuData}>
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, limits.cpu]} tickFormatter={(v) => `${v}%`} />
                            <ReTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke={accentColor} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBlock>
            </div>
            <div className="transform-gpu skeleton-anim-2" style={{ animationDelay: `275ms` }}>
                <ChartBlock title={'RAM'}>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={ramData}>
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, limits.memory]} tickFormatter={(v) => `${v} MiB`} />
                            <ReTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke={accentColor} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBlock>
            </div>
            <div className="transform-gpu skeleton-anim-2" style={{ animationDelay: `300ms` }}>
                <ChartBlock
                    title={'Network Activity'}
                    legend={
                        <div className='flex gap-2'>
                            <Tooltip.Root delayDuration={200}>
                                <Tooltip.Trigger asChild>
                                    <div className='flex items-center cursor-default'>
                                        <FontAwesomeIcon
                                            icon={faCloudDownloadAlt}
                                            className='mr-2 w-4 h-4 text-yellow-400'
                                        />
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side='top'
                                        className='px-2 py-1 text-sm bg-gray-800 text-gray-100 rounded shadow-lg'
                                        sideOffset={5}
                                    >
                                        Inbound
                                        <Tooltip.Arrow className='fill-gray-800' />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                            <Tooltip.Root delayDuration={200}>
                                <Tooltip.Trigger asChild>
                                    <div className='flex items-center cursor-default'>
                                        <FontAwesomeIcon icon={faCloudUploadAlt} className='w-4 h-4 text-blue-400' />
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side='top'
                                        className='px-2 py-1 text-sm bg-gray-800 text-gray-100 rounded shadow-lg'
                                        sideOffset={5}
                                    >
                                        Outbound
                                        <Tooltip.Arrow className='fill-gray-800' />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>
                    }
                >
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={networkData}>
                            <XAxis dataKey="name" hide />
                            <YAxis tickFormatter={bytesToString} />
                            <ReTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="in" stroke="#facc15" dot={false} strokeWidth={2} name="Inbound" />
                            <Line type="monotone" dataKey="out" stroke="#60a5fa" dot={false} strokeWidth={2} name="Outbound" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBlock>
            </div>
        </Tooltip.Provider>
    );
};

export default StatGraphs;