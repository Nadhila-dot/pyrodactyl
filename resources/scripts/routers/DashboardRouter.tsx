import { useStoreState } from 'easy-peasy';
import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';

import routes from '@/routers/routes';

import DashboardContainer from '@/components/dashboard/DashboardContainer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, UserCog } from "lucide-react"

import MainSidebar from '@/components/elements/MainSidebar';
import MainWrapper from '@/components/elements/MainWrapper';
import Logo from '@/components/elements/PyroLogo';
import { NotFound } from '@/components/elements/ScreenBlock';
import HugeIconsApi from '@/components/elements/hugeicons/Api';
import HugeIconsDashboardSettings from '@/components/elements/hugeicons/DashboardSettings';
import HugeIconsHome from '@/components/elements/hugeicons/Home';
import HugeIconsSsh from '@/components/elements/hugeicons/Ssh';
import HugeIconsHamburger from '@/components/elements/hugeicons/hamburger';
import { Player } from '@lordicon/react';
import { IconBrandUnsplash, IconBrush, IconKey, IconLinkPlus, IconLogout2, IconPalette, IconServer, IconSettings, IconUnlink, IconUser, IconUserShield } from '@tabler/icons-react'

import http, { httpStats } from '@/api/http';
import Footer from '@/components/Footer/footer';
import { Separator } from '@/components/ui/separator';
import ThemeContainer from '@/components/dashboard/ThemeContainer';

const DashboardRouter = () => {
    const location = useLocation();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);

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
        if ((sidebarPosition - sidebarRef.current?.clientWidth) / sidebarRef.current?.clientWidth > -1.35) {
            showSideBar(true);
        } else {
            showSideBar(false);
        }
    };

    // *************************** END SIDEBAR GESTURE *************************** //

    const onTriggerLogout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const onSelectAdminPanel = () => {
        window.open(`/admin`);
    };

    // Define refs for navigation buttons.
    const NavigationHome = useRef(null);
    const NavigationSettings = useRef(null);
    const NavigationApi = useRef(null);
    const NavigationSSH = useRef(null);


    //@ts-ignore
    const user = window.PterodactylUser;

    const calculateTop = (pathname: string) => {
        // Get currents of navigation refs.
        const ButtonHome = NavigationHome.current;
        const ButtonSettings = NavigationSettings.current;
        const ButtonApi = NavigationApi.current;
        const ButtonSSH = NavigationSSH.current;

        // Perfectly center the page highlighter with simple math.
        // Height of navigation links (56) minus highlight height (40) equals 16. 16 devided by 2 is 8.
        const HighlightOffset: number = 8;

        if (pathname.endsWith(`/`) && ButtonHome != null) return (ButtonHome as any).offsetTop + HighlightOffset;
        if (pathname.endsWith(`/account`) && ButtonSettings != null)
            return (ButtonSettings as any).offsetTop + HighlightOffset;
        if (pathname.endsWith('/api') && ButtonApi != null) return (ButtonApi as any).offsetTop + HighlightOffset;
        if (pathname.endsWith('/ssh') && ButtonSSH != null) return (ButtonSSH as any).offsetTop + HighlightOffset;
        return '0';
    };

    const top = calculateTop(location.pathname);

    const [height, setHeight] = useState('40px');

    useEffect(() => {
        setHeight('34px');
        const timeoutId = setTimeout(() => setHeight('40px'), 200);
        return () => clearTimeout(timeoutId);
    }, [top]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <Fragment key={'dashboard-router'}>
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
                className='lg:hidden fixed flex items-center justify-center top-5 left-2 z-50 bg-black p-3 rounded-lg text-white shadow-lg hover:bg-zinc-900 transition-colors duration-200 cursor-pointer'
                onClick={toggleSidebar}
                aria-label='Toggle sidebar'
            >
                <HugeIconsHamburger fill='currentColor' />
            </button>

            <MainSidebar
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-9999 w-60 xl:w-64 bg-black text-white ${isSidebarBetween ? 'transition-transform duration-300 ease-in-out' : ''} lg:translate-x-0 lg:relative lg:flex lg:shrink-0 border-r border-gray-900`}
                style={{
                    transform: `translate(${sidebarPosition}px)`,
                }}
            >
                {/* Sidebar Content */}
                <div className="flex flex-col h-full p-3 xl:p-4">
                    {/* Header */}
                    <div className='flex items-center justify-between mb-3 xl:mb-4'>
                        <NavLink to={'/'} className='flex items-center w-full justify-start'>
                            <div className="scale-100 xl:scale-105 transition-transform duration-200 ml-1">
                                <Logo />
                                <Separator className="mt-2 mr-2 max-w-1/3 opacity-25" />
                            </div>
                        </NavLink>
                    </div>




                    {/* Welcome Message */}
                    <div className="mb-8 xl:mb-9">
                        <h2 className="text-xl xl:text-xl font-semibold text-white mb-1">
                            Good {new Date().getHours() >= 12 ? 'evening' : 'morning'}!
                        </h2>
                        <p className="text-gray-400 text-sm xl:text-sm">Welcome back, {user?.username || 'User'}</p>
                        <p className="text-gray-400 font-thin text-sm xl:text-sm">Total Http requests: {httpStats.totalRequests}</p>
                    </div>


                    {/* Navigation */}
                    <nav className="flex-1  ">
                        <ul className='space-y-1.5  xl:space-y-2 pr-3' onClick={toggleSidebar}>
                            <li>
                                <NavLink
                                    to={'/'}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center space-x-4 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                        }`
                                    }
                                    ref={NavigationHome}
                                >
                                    <IconServer size={18} className="xl:w-[19px] xl:h-[19px]" />
                                    <span className="font-medium text-sm xl:text-sm">Servers</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={'/account/api'}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3.5 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                        }`
                                    }
                                    ref={NavigationApi}
                                >
                                    <IconKey size={18} className="xl:w-[19px] xl:h-[19px]" />
                                    <span className="font-medium text-sm xl:text-sm">API Keys</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={'/account/ssh'}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3.5 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                        }`
                                    }
                                    ref={NavigationSSH}
                                >
                                    <IconLinkPlus size={18} className="xl:w-[19px] xl:h-[19px]" />
                                    <span className="font-medium text-sm xl:text-sm">SSH Keys</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={'/account'}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3.5 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
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
                            <li>
                                <NavLink
                                    to={'/theme'}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3.5 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                        }`
                                    }
                                    ref={NavigationHome}
                                >
                                    <IconPalette size={18} className="xl:w-[19px] xl:h-[19px]" />
                                    <span className="font-medium text-sm xl:text-sm">Panel Settings</span>
                                </NavLink>
                            </li>
                            {rootAdmin && (
                                <li>
                                    <NavLink
                                        to={'/admin'}
                                        end
                                        className={({ isActive }) =>
                                            `flex items-center space-x-3.5 xl:space-x-4 px-3.5 xl:px-4 py-3 xl:py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-zinc-900 text-white border-l-2 xl:border-l-[3px] border-green-500'
                                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'
                                            }`
                                        }
                                    >
                                        <IconUserShield size={18} className="xl:w-[19px] xl:h-[19px]" />
                                        <span className="font-medium text-sm xl:text-sm">Admin Panel</span>
                                    </NavLink>
                                </li>
                            )}
                           
                        </ul>
                    </nav>

                    {/* User Profile */}
                    <div className="mt-auto pt-4 xl:pt-5 border-t border-gray-900">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full h-auto p-3 xl:p-3.5 rounded-lg hover:bg-black/80 transition-colors duration-200 justify-start gap-3 z-[99999]"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
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
                                            {user?.email || 'user@creepercloud.io'}
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 xl:w-2 xl:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-black/90 border-gray-700 text-gray-200 z-[99999]">
                                {rootAdmin && (
                                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-white cursor-pointer">
                                        <IconUserShield className="mr-2 h-4 w-4" />
                                        <span>Admin</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-green-400 hover:bg-green-900/20 hover:text-green-400 focus:bg-green-900/20 focus:text-green-400 cursor-pointer"
                                    onClick={handleLogout}
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
                <MainWrapper
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className='relative inset-[1px] w-full h-full overflow-y-auto overflow-x-hidden rounded-md bg-black text-white '
                >
                    <main
                        className='relative w-full h-full'
                    >
                        <Routes>
                            <Route path='' element={<DashboardContainer />} />

                            <Route path='/theme' element={<ThemeContainer />} />

                            {/* Account Routes */}
                            {routes.account.map(({ route, component: Component }) => (
                                <Route
                                    key={route}
                                    path={`/account/${route}`.replace('//', '/')}
                                    element={<Component />}
                                />
                            ))}

                            {/* Admin Route */}
                            {rootAdmin && routes.admin?.map(({ route, component: Component }) => (
                                <Route
                                    key={route}
                                    path={`/admin/${route}`.replace('//', '/')}
                                    element={<Component />}
                                />
                            ))}

                            <Route path='*' element={<NotFound />} />
                        </Routes>
                    </main>
                </MainWrapper>
            </Suspense>

        </Fragment>
    );
};

export default DashboardRouter;