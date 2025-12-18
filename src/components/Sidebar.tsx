import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Settings,
    Shield,
    Trophy,
    BookOpen,
    LogOut,
    Menu,
    ChevronLeft,
} from 'lucide-react';
import { ROUTES } from '../router/routeMap';
import { cn } from '../lib/utils';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
    badge?: string;
}

const menuItems: MenuItem[] = [
    {
        id: 'home',
        label: 'Homepage',
        icon: Home,
        route: ROUTES.DASHBOARD,
    },
    {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: Trophy,
        route: ROUTES.LEADERBOARD,
    },
    {
        id: 'modules',
        label: 'Modules',
        icon: BookOpen,
        route: ROUTES.MODULES.FLOOD_INTRO,
    },
    {
        id: 'settings',
        label: 'User Settings',
        icon: Settings,
        route: ROUTES.SETTINGS.USER,
    },
    {
        id: 'parental',
        label: 'Parental Controls',
        icon: Shield,
        route: ROUTES.SETTINGS.PARENTAL_CONTROLS,
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: controlledIsOpen, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [internalIsOpen, setInternalIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = onToggle ? () => onToggle() : setInternalIsOpen;

    // Hide sidebar on auth pages
    const hideOnRoutes = [
        ROUTES.LANDING,
        ROUTES.AUTH.LOGIN,
        ROUTES.AUTH.SIGNUP,
        ROUTES.AUTH.VERIFY_EMAIL,
        ROUTES.AUTH.SELECT_AVATAR,
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            // Auto-collapse on mobile
            if (window.innerWidth < 768) {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [setIsOpen]);

    if (hideOnRoutes.includes(location.pathname as any)) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate(ROUTES.LANDING);
    };

    const handleNavClick = (route: string) => {
        navigate(route);
        // Close sidebar on mobile after navigation
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const isActive = (route: string) => {
        if (route === ROUTES.DASHBOARD) {
            return location.pathname === route;
        }
        return location.pathname.startsWith(route);
    };

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isOpen ? (isMobile ? '280px' : '260px') : '80px',
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                    'fixed left-0 top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50',
                    'flex flex-col shadow-xl',
                    'transition-all duration-300'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <AnimatePresence mode="wait">
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 flex-1"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                    RISER
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            'p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                            'text-slate-600 dark:text-slate-400'
                        )}
                        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {isOpen ? (
                            <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.route);
                            
                            return (
                                <li key={item.id}>
                                    <motion.button
                                        onClick={() => handleNavClick(item.route)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                            'relative group',
                                            active
                                                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        )}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className={cn(
                                            'w-5 h-5 flex-shrink-0',
                                            active && 'text-white'
                                        )} />
                                        
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="font-medium flex-1 text-left"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Active indicator */}
                                        {active && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-2 w-2 h-2 bg-white rounded-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Tooltip when collapsed */}
                                        {!isOpen && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                                                {item.label}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700 border-b-4 border-b-transparent" />
                                            </div>
                                        )}
                                    </motion.button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer - Logout */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <motion.button
                        onClick={handleLogout}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                            'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                            'group relative'
                        )}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="font-medium flex-1 text-left"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Tooltip when collapsed */}
                        {!isOpen && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                                Logout
                                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700 border-b-4 border-b-transparent" />
                            </div>
                        )}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Mobile menu button (when sidebar is closed) */}
            {isMobile && !isOpen && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </motion.button>
            )}
        </>
    );
};

export default Sidebar;
