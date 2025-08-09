'use client';

import { useStoreState } from 'easy-peasy';
import { on } from 'events';
import type React from 'react';
import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';

import routes from '@/routers/routes';

import Can from '@/components/elements/Can';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, UserCog } from "lucide-react"
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import MainSidebar from '@/components/elements/MainSidebar';
import MainWrapper from '@/components/elements/MainWrapper';
import PermissionRoute from '@/components/elements/PermissionRoute';
import Logo from '@/components/elements/PyroLogo';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import CommandMenu from '@/components/elements/commandk/CmdK';
import HugeIconsHamburger from '@/components/elements/hugeicons/hamburger';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import InstallListener from '@/components/server/InstallListener';
import TransferListener from '@/components/server/TransferListener';
import WebsocketHandler from '@/components/server/WebsocketHandler';

import { httpErrorToHuman } from '@/api/http';
import http from '@/api/http';
import getNests from '@/api/nests/getNests';

import { ServerContext } from '@/state/server';
import {
    IconServer,
    IconFolder,
    IconDatabase,
    IconCloudUp,
    IconNetwork,
    IconUsers,
    IconTerminal,
    IconClock,
    IconSettings,
    IconPencil,
    IconDeviceGamepad2,
    IconUserShield,
    IconHome
} from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';

const blank_egg_prefix = '@';

interface Egg {
    object: string;
    attributes: {
        uuid: string;
        name: string;
        description: string;
    };
}

interface Nest {
    object: string;
    attributes: {
        id: number;
        name: string;
        relationships: {
            eggs: {
                object: string;
                data: Egg[];
            };
        };
    };
}

const ServerRouter = () => {
    const params = useParams<'id'>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);
    const egg_id = ServerContext.useStoreState((state) => state.server.data?.egg);
    const [nests, setNests] = useState<Nest[]>();

    // ************************** BEGIN SIDEBAR GESTURE ************************** //

    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [isSidebarBetween, setSidebarBetween] = useState(false);
    const [doneOnLoad, setDoneOnLoad] = useState(false);

    const [sidebarPosition, setSidebarPosition] = useState(-1000);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const showSideBar = (shown: boolean) => {
        setSidebarVisible(shown);

        // @ts-expect-error - Legacy type suppression
        if (!shown) setSidebarPosition(-500);
        else setSidebarPosition(0);
    };

    const checkIfMinimal = () => {
        // @ts-expect-error - Legacy type suppression
        if (!(window.getComputedStyle(sidebarRef.current, null).display === 'block')) {
            showSideBar(true);
            return true;
        }

        // showSideBar(false);
        return false;
    };

    const toggleSidebar = () => {
        if (checkIfMinimal()) return;
        showSideBar(!isSidebarVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSidebarVisible && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                if (checkIfMinimal()) return;
                showSideBar(false);
            }
        };

        // to do, develop a bit more. This is currently a hack and probably not robust.
        const windowResize = () => {
            if (window.innerWidth > 1023) {
                showSideBar(true);
                return true;
            }

            showSideBar(false);
            return false;
        };

        if (!doneOnLoad) {
            windowResize();
            setDoneOnLoad(true);
        }

        window.addEventListener('resize', windowResize);

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', windowResize);
        };
    }, [isSidebarVisible]);

    // Handle touch events for swipe to close
    const handleTouchStart = (e: React.TouchEvent) => {
        if (checkIfMinimal()) return;
        // @ts-expect-error - Legacy type suppression it is not "possibly undefined." Pretty much guarunteed to work.

        if (isSidebarVisible) setTouchStartX(e.touches[0].clientX - sidebarRef.current?.clientWidth);
        // @ts-expect-error - Legacy type suppression
        else setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (checkIfMinimal()) return;

        // @ts-expect-error - Legacy type suppression go to sleep TSC
        const sidebarWidth = sidebarRef.current.clientWidth;
        // @ts-expect-error - Legacy type suppression
        if (e.touches[0].clientX - touchStartX < 30) {
            setSidebarPosition(-sidebarWidth);
            return;
        }

        // @ts-expect-error - Legacy type suppression
        const clampedValue = Math.max(Math.min(e.touches[0].clientX - touchStartX, sidebarWidth), 0) - sidebarWidth;

        setSidebarBetween(false);

        console.group('updateDragLocation');
        console.info(`start ${clampedValue}`);
        console.groupEnd();

        setSidebarPosition(clampedValue);
    };

    const handleTouchEnd = () => {
        if (checkIfMinimal()) return;

        setTouchStartX(null);
        setSidebarBetween(true);

        // @ts-expect-error - Legacy type suppression
        // @ts-expect-error - Legacy type suppression
        if ((sidebarPosition - sidebarRef.current?.clientWidth) / sidebarRef.current?.clientWidth > -1.35) {
            showSideBar(true);
        } else {
            showSideBar(false);
        }
    };

    // *************************** END SIDEBAR GESTURE *************************** //

    const egg_name =
        nests &&
        nests
            .find((nest) => nest.attributes.relationships.eggs.data.find((egg) => egg.attributes.uuid === egg_id))
            ?.attributes.relationships.eggs.data.find((egg) => egg.attributes.uuid === egg_id)?.attributes.name;

    useEffect(() => {
        const fetchData = async () => {
            const data = await getNests();
            setNests(data);
        };

        fetchData();
    }, []);

    const onTriggerLogout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const onSelectManageServer = () => {
        window.open(`/admin/servers/view/${serverId}`);
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        [],
    );

    useEffect(() => {
        setError('');

        if (params.id === undefined) {
            return;
        }

        getServer(params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [params.id]);

    // Define refs for navigation buttons.
    const NavigationHome = useRef(null);
    const NavigationFiles = useRef(null);
    const NavigationDatabases = useRef(null);
    const NavigationBackups = useRef(null);
    const NavigationNetworking = useRef(null);
    const NavigationUsers = useRef(null);
    const NavigationStartup = useRef(null);
    const NavigationSchedules = useRef(null);
    const NavigationSettings = useRef(null);
    const NavigationActivity = useRef(null);
    const NavigationMod = useRef(null);
    const NavigationShell = useRef(null);

    const calculateTop = (pathname: string) => {
        if (!id) return '0';

        // Get currents of navigation refs.
        const ButtonHome = NavigationHome.current;
        const ButtonFiles = NavigationFiles.current;
        const ButtonDatabases = NavigationDatabases.current;
        const ButtonBackups = NavigationBackups.current;
        const ButtonNetworking = NavigationNetworking.current;
        const ButtonUsers = NavigationUsers.current;
        const ButtonStartup = NavigationStartup.current;
        const ButtonSchedules = NavigationSchedules.current;
        const ButtonSettings = NavigationSettings.current;
        const ButtonShell = NavigationShell.current;
        const ButtonActivity = NavigationActivity.current;
        const ButtonMod = NavigationMod.current;

        // Perfectly center the page highlighter with simple math.
        // Height of navigation links (56) minus highlight height (40) equals 16. 16 devided by 2 is 8.
        const HighlightOffset: number = 8;

        if (pathname.endsWith(`/server/${id}`) && ButtonHome != null)
            return (ButtonHome as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/files`) && ButtonFiles != null)
            return (ButtonFiles as any).offsetTop + HighlightOffset;
        if (new RegExp(`^/server/${id}/files(/(new|edit).*)?$`).test(pathname) && ButtonFiles != null)
            return (ButtonFiles as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/databases`) && ButtonDatabases != null)
            return (ButtonDatabases as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/backups`) && ButtonBackups != null)
            return (ButtonBackups as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/network`) && ButtonNetworking != null)
            return (ButtonNetworking as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/users`) && ButtonUsers != null)
            return (ButtonUsers as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/startup`) && ButtonStartup != null)
            return (ButtonStartup as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/schedules`) && ButtonSchedules != null)
            return (ButtonSchedules as any).offsetTop + HighlightOffset;
        if (new RegExp(`^/server/${id}/schedules/\\d+$`).test(pathname) && ButtonSchedules != null)
            return (ButtonSchedules as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/settings`) && ButtonSettings != null)
            return (ButtonSettings as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/shell`) && ButtonShell != null)
            return (ButtonShell as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/activity`) && ButtonActivity != null)
            return (ButtonActivity as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/server/${id}/mods`) && ButtonMod != null)
            return (ButtonMod as any).offsetTop + HighlightOffset;

        return '0';
    };

    const top = calculateTop(location.pathname);

    const [height, setHeight] = useState('40px');

    useEffect(() => {
        setHeight('34px');
        const timeoutId = setTimeout(() => setHeight('40px'), 200);
        return () => clearTimeout(timeoutId);
    }, [top]);

    const user = window.PterodactylUser;
    const serverName = ServerContext.useStoreState((state) => state.server.data?.name);

    return (
        <Fragment key={'server-router'}>
            {!uuid || !id ? (
                error ? (
                    <ServerError title='Something went wrong' message={error} />
                ) : null
            ) : (
                <>
                    {isSidebarVisible && (
                        <div
                            className='lg:hidden fixed inset-0 bg-black/60 z-9998 transition-opacity duration-300 backdrop-blur-sm'
                            onClick={() => showSideBar(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                    )}

                    <button
                        id='sidebarToggle'
                        className='lg:hidden fixed flex items-center justify-center top-5 left-5 z-50 bg-black p-3 rounded-lg text-white shadow-lg hover:bg-zinc-900 transition-colors duration-200 cursor-pointer'
                        onClick={toggleSidebar}
                        aria-label='Toggle sidebar'
                    >
                        <HugeIconsHamburger fill='currentColor' />
                    </button>

                    <MainSidebar
                        ref={sidebarRef}
                        className={`fixed inset-y-0 left-0 z-9999 w-72 xl:w-80 bg-black text-white ${isSidebarBetween ? 'transition-transform duration-300 ease-in-out' : ''} lg:translate-x-0 lg:relative lg:flex lg:shrink-0 border-r border-gray-900`}
                        style={{
                            transform: `translate(${sidebarPosition}px)`,
                        }}
                    >
                        {/* Active Route Indicator */}
                        {/*}
                        <div
                            className='absolute bg-green-500 w-[2px] h-10 left-0 rounded-full pointer-events-none'
                            style={{
                                top,
                                height,
                                opacity: top === '0' ? 0 : 1,
                                transition:
                                    'linear(0,0.006,0.025 2.8%,0.101 6.1%,0.539 18.9%,0.721 25.3%,0.849 31.5%,0.937 38.1%,0.968 41.8%,0.991 45.7%,1.006 50.1%,1.015 55%,1.017 63.9%,1.001) 390ms',
                            }}
                        />
                        */}

                        {/* Sidebar Content */}
                        <div className="flex flex-col h-full p-4 xl:p-5">
                            {/* Header */}
                            <div className='flex items-center justify-between mb-4 xl:mb-5'>
                                <NavLink to={'/'} className='flex items-center'>
                                    <div className="scale-100 xl:scale-105 transition-transform duration-200">
                                        <Logo />
                                        <Separator className="max-w-1/2 mt-4" />
                                    </div>
                                </NavLink>
                            </div>

                            {/* Server Info */}
                            <div className="mb-4 xl:mb-5">
                                <h2 className="text-xl xl:text-xl font-semibold text-white mb-1">
                                    {serverName || 'Server'}
                                </h2>
                                <p className="text-gray-400 text-sm xl:text-sm">
                                    {egg_name || 'Unknown Type'}
                                </p>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1">
                                <ul className='space-y-1 xl:space-y-1.5' onClick={toggleSidebar}>
                                    <li>
                                        <NavLink
                                            to={`/server/${id}`}
                                            end
                                            className={({ isActive }) =>
                                                `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                    : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                }`
                                            }
                                            ref={NavigationHome}
                                        >
                                            <IconHome size={18} className="xl:w-[19px] xl:h-[19px]" />
                                            <span className="font-medium text-sm xl:text-sm">Home</span>
                                        </NavLink>
                                    </li>

                                    {egg_name && !egg_name?.includes(blank_egg_prefix) && (
                                        <>
                                            <Can action={'file.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/files`}
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationFiles}
                                                    >
                                                        <IconFolder size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Files</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={'database.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/databases`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationDatabases}
                                                    >
                                                        <IconDatabase size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Databases</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={'backup.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/backups`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationBackups}
                                                    >
                                                        <IconCloudUp size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Backups</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={'allocation.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/network`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationNetworking}
                                                    >
                                                        <IconNetwork size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Networking</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={'user.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/users`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationUsers}
                                                    >
                                                        <IconUsers size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Users</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={['startup.read', 'startup.update', 'startup.docker-image']} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/startup`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationStartup}
                                                    >
                                                        <IconTerminal size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Startup</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={'schedule.*'} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/schedules`}
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationSchedules}
                                                    >
                                                        <IconClock size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Schedules</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={['settings.*', 'file.sftp']} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/settings`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationSettings}
                                                    >
                                                        <IconSettings size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Settings</span>
                                                    </NavLink>
                                                </li>
                                            </Can>

                                            <Can action={['activity.*', 'activity.read']} matchAny>
                                                <li>
                                                    <NavLink
                                                        to={`/server/${id}/activity`}
                                                        end
                                                        className={({ isActive }) =>
                                                            `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                            }`
                                                        }
                                                        ref={NavigationActivity}
                                                    >
                                                        <IconPencil size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                        <span className="font-medium text-sm xl:text-sm">Activity</span>
                                                    </NavLink>
                                                </li>
                                            </Can>
                                        </>
                                    )}

                                    <Can action={'startup.software'}>
                                        <li>
                                            <NavLink
                                                to={`/server/${id}/shell`}
                                                end
                                                className={({ isActive }) =>
                                                    `flex items-center space-x-3 xl:space-x-3.5 px-3 xl:px-3.5 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                        ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                        : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                                    }`
                                                }
                                                ref={NavigationShell}
                                            >
                                                <IconDeviceGamepad2 size={18} className="xl:w-[19px] xl:h-[19px]" />
                                                <span className="font-medium text-sm xl:text-sm">Software</span>
                                            </NavLink>
                                        </li>
                                    </Can>
                                </ul>
                            </nav>

                            {/* User Profile */}
                            <div className="mt-auto pt-4 xl:pt-5 border-t border-gray-900">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-auto p-3 xl:p-3.5 rounded-lg hover:bg-gray-800/70 transition-colors duration-200 justify-start gap-3"
                                        >
                                            <div className="w-8 h-8 xl:w-9 xl:h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-black font-semibold text-sm">
                                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="text-sm xl:text-sm font-medium text-white truncate">
                                                    {user?.username || 'User'}
                                                </div>
                                                <div className="text-xs xl:text-xs text-gray-400 truncate">
                                                    {user?.email || 'user@panel.com'}
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 xl:w-2 xl:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-800 border-gray-700 text-gray-200">
                                        {rootAdmin && (
                                            <DropdownMenuItem
                                                className="focus:bg-gray-700 focus:text-white cursor-pointer"
                                                onSelect={onSelectManageServer}
                                            >
                                                <IconUserShield className="mr-2 h-4 w-4" />
                                                <span>Manage Server</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="text-green-400 hover:bg-green-900/20 hover:text-green-400 focus:bg-green-900/20 focus:text-green-400 cursor-pointer"
                                            onSelect={onTriggerLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </MainSidebar>

                    <Suspense fallback={null}>
                        <MainWrapper onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                            <CommandMenu />
                            <InstallListener />
                            <TransferListener />
                            <WebsocketHandler />
                            <main
                                nadhi-mng-data=''
                                className='relative inset-[1px] w-full h-full overflow-y-auto overflow-x-hidden rounded-md bg-black text-white'
                            >
                                {inConflictState &&
                                    (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                                    <ConflictStateRenderer />
                                ) : (
                                    <ErrorBoundary>
                                        <Routes location={location}>
                                            {routes.server.map(({ route, permission, component: Component }) => (
                                                <Route
                                                    key={route}
                                                    path={route}
                                                    element={
                                                        <PermissionRoute permission={permission}>
                                                            <Suspense fallback={null}>
                                                                <Component />
                                                            </Suspense>
                                                        </PermissionRoute>
                                                    }
                                                />
                                            ))}

                                            <Route path='*' element={<NotFound />} />
                                        </Routes>
                                    </ErrorBoundary>
                                )}
                            </main>
                        </MainWrapper>
                    </Suspense>
                </>
            )}
        </Fragment>
    );
};

export default ServerRouter;