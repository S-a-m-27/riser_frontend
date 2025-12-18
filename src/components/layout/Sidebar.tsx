import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    BookOpen,
    Brain,
    Puzzle,
    Gamepad2,
    Trophy,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
} from 'lucide-react';
import { ROUTES } from '../../router/routeMap';
import SidebarItem from './SidebarItem';
import { cn } from '../../lib/utils';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
    matchRoutes?: string[]; // Routes that should highlight this item as active
}

const menuItems: MenuItem[] = [
    {
        id: 'home',
        label: 'Home',
        icon: Home,
        route: ROUTES.DASHBOARD,
    },
    {
        id: 'lessons',
        label: 'Lessons',
        icon: BookOpen,
        route: ROUTES.MODULES.LESSON_FLOOD,
        matchRoutes: ['/lesson', '/modules'],
    },
    {
        id: 'quizzes',
        label: 'Quizzes',
        icon: Brain,
        route: ROUTES.QUIZ.FLOOD,
        matchRoutes: ['/quiz'],
    },
    {
        id: 'puzzles',
        label: 'Puzzles',
        icon: Puzzle,
        route: ROUTES.PUZZLE_FLOOD,
        matchRoutes: ['/puzzle'],
    },
    {
        id: 'simulations',
        label: 'Simulations',
        icon: Gamepad2,
        route: ROUTES.SIMULATION.INTRO,
        matchRoutes: ['/simulation'],
    },
    {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: Trophy,
        route: ROUTES.LEADERBOARD,
    },
    {
        id: 'certificate',
        label: 'Certificate',
        icon: GraduationCap,
        route: ROUTES.RESULTS.CERTIFICATE,
        matchRoutes: ['/results'],
    },
    {
        id: 'settings',
        label: 'User Settings',
        icon: Settings,
        route: ROUTES.SETTINGS.USER,
        matchRoutes: ['/settings'],
    },
];

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
    onMobileOpen?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose, onMobileOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);
    const [internalMobileOpen, setInternalMobileOpen] = useState(false);
    
    const mobileOpen = isMobileOpen !== undefined ? isMobileOpen : internalMobileOpen;
    const setMobileOpen = (open: boolean) => {
        if (isMobileOpen !== undefined) {
            // Controlled mode
            if (open && onMobileOpen) onMobileOpen();
            if (!open && onMobileClose) onMobileClose();
        } else {
            // Uncontrolled mode
            setInternalMobileOpen(open);
        }
    };

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
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (hideOnRoutes.includes(location.pathname as any)) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate(ROUTES.LANDING);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleNavClick = (route: string) => {
        navigate(route);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const isActive = (item: MenuItem): boolean => {
        if (item.route === location.pathname) return true;
        if (item.matchRoutes) {
            return item.matchRoutes.some(route => location.pathname.startsWith(route));
        }
        return false;
    };

    const handleBack = () => {
        navigate(-1);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleHome = () => {
        navigate(ROUTES.DASHBOARD);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const sidebarContent = (
        <>
            {/* Navigation Buttons */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                    <motion.button
                        onClick={handleBack}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300',
                            'bg-white/70 dark:bg-slate-800/70 border-2 border-blue-200/60 dark:border-blue-700/60',
                            'hover:bg-white/95 dark:hover:bg-slate-800/95',
                            'hover:border-blue-400 dark:hover:border-blue-500',
                            'hover:shadow-lg hover:shadow-blue-500/20',
                            'text-blue-600 dark:text-blue-400',
                            'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                        )}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </motion.button>
                    <motion.button
                        onClick={handleHome}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300',
                            'bg-white/70 dark:bg-slate-800/70 border-2 border-green-200/60 dark:border-green-700/60',
                            'hover:bg-white/95 dark:hover:bg-slate-800/95',
                            'hover:border-green-400 dark:hover:border-green-500',
                            'hover:shadow-lg hover:shadow-green-500/20',
                            'text-green-600 dark:text-green-400',
                            'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2'
                        )}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-medium">Home</span>
                    </motion.button>
                </div>
            </div>

            {/* Menu Items */}
            <nav 
                className={cn(
                    "flex-1 overflow-y-auto py-6 px-3",
                    "scroll-smooth",
                    // Custom scrollbar styles for better interactivity - matching sidebar gradient
                    "[&::-webkit-scrollbar]:w-2.5",
                    "[&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-track]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:bg-blue-500/80 dark:[&::-webkit-scrollbar-thumb]:bg-blue-400/80",
                    "[&::-webkit-scrollbar-thumb]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:hover:bg-blue-600/90 dark:[&::-webkit-scrollbar-thumb]:hover:bg-blue-500/90",
                    "[&::-webkit-scrollbar-thumb]:active:bg-blue-700 dark:[&::-webkit-scrollbar-thumb]:active:bg-blue-600",
                    "[&::-webkit-scrollbar-thumb]:transition-all",
                    "[&::-webkit-scrollbar-thumb]:duration-200",
                    "[&::-webkit-scrollbar-thumb]:cursor-pointer",
                    "[&::-webkit-scrollbar-thumb]:shadow-inner",
                    "[&::-webkit-scrollbar-thumb]:hover:shadow-md",
                    "[&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white/30 dark:[&::-webkit-scrollbar-thumb]:border-white/20",
                    // Smooth scrolling behavior
                    "scroll-behavior-smooth",
                    // Focus styles for keyboard navigation
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                )}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 transparent',
                }}
                tabIndex={0}
            >
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.li
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <SidebarItem
                                    icon={Icon as any}
                                    label={item.label}
                                    isActive={isActive(item)}
                                    onClick={() => handleNavClick(item.route)}
                                />
                            </motion.li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                    onClick={handleLogout}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                        'text-red-600 dark:text-red-400',
                        'hover:bg-red-50 dark:hover:bg-red-900/20',
                        'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
                    )}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-base flex-1 text-left">Logout</span>
                </motion.button>
            </div>
        </>
    );

    // Desktop: Fixed sidebar
    if (!isMobile) {
        return (
            <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                    'fixed left-0 top-0 h-screen w-[260px]',
                    'bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-900/50',
                    'border-r border-slate-200 dark:border-slate-700',
                    'rounded-r-3xl shadow-xl',
                    'flex flex-col z-40',
                    'backdrop-blur-sm'
                )}
            >
                {sidebarContent}
            </motion.aside>
        );
    }

    // Mobile: Slide-in drawer
    return (
        <>
            {/* Hamburger Button */}
            {!mobileOpen && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setMobileOpen(true)}
                    className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </motion.button>
            )}

            {/* Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />
                        <motion.aside
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={cn(
                                'fixed left-0 top-0 h-screen w-[260px]',
                                'bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-900/50',
                                'border-r border-slate-200 dark:border-slate-700',
                                'rounded-r-3xl shadow-2xl',
                                'flex flex-col z-50'
                            )}
                        >
                            {/* Close Button */}
                            <div className="flex justify-end p-4">
                                <motion.button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Close menu"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                                </motion.button>
                            </div>
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
