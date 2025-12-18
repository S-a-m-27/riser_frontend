import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../router/routeMap';
import { cn } from '../lib/utils';

interface NavigationButtonsProps {
    className?: string;
    showBack?: boolean;
    backRoute?: string;
    homeRoute?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
    className,
    showBack = true,
    backRoute,
    homeRoute = ROUTES.DASHBOARD
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredButton, setHoveredButton] = useState<'back' | 'home' | null>(null);

    const handleBack = () => {
        if (backRoute) {
            navigate(backRoute);
        } else {
            // Go back in browser history
            navigate(-1);
        }
    };

    const handleHome = () => {
        navigate(homeRoute);
    };

    // Don't show on landing page or auth pages
    const hideOnRoutes = [
        ROUTES.LANDING,
        ROUTES.AUTH.LOGIN,
        ROUTES.AUTH.SIGNUP,
        ROUTES.AUTH.VERIFY_EMAIL,
        ROUTES.AUTH.SELECT_AVATAR,
    ];

    if (hideOnRoutes.includes(location.pathname)) {
        return null;
    }

    const buttonBaseClasses = "relative w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md border-2 backdrop-blur-md";
    
    // Position buttons at top-left, accounting for sidebar and header
    // Sidebar is 260px wide, so position buttons to the right of it when visible
    // Header is sticky at top-0, so position buttons below it (top-16 = 4rem = 64px)
    const hasSidebar = !hideOnRoutes.includes(location.pathname);
    const leftPosition = hasSidebar ? "left-[276px]" : "left-4"; // 260px sidebar + 16px gap
    const topPosition = "top-20"; // Below sticky header (64px + some padding)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "fixed z-50 flex flex-col gap-3 p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl",
                topPosition,
                leftPosition,
                className
            )}
        >
            {showBack && (
                <div
                    className="relative group"
                    onMouseEnter={() => setHoveredButton('back')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <motion.button
                        onClick={handleBack}
                        className={cn(
                            buttonBaseClasses,
                            "bg-white/70 dark:bg-slate-800/70 border-blue-200/60 dark:border-blue-700/60",
                            "hover:bg-white/95 dark:hover:bg-slate-800/95",
                            "hover:border-blue-400 dark:hover:border-blue-500",
                            "hover:shadow-xl hover:shadow-blue-500/30",
                            "active:scale-95",
                            "group-hover:scale-105"
                        )}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <ArrowLeft className="w-5 h-5 text-blue-600/80 dark:text-blue-400/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        
                        {/* Ripple effect on hover */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-blue-400/20"
                            initial={{ scale: 1, opacity: 0 }}
                            animate={{
                                scale: hoveredButton === 'back' ? 1.5 : 1,
                                opacity: hoveredButton === 'back' ? [0, 0.3, 0] : 0,
                            }}
                            transition={{ duration: 0.6 }}
                        />
                    </motion.button>
                    
                    {/* Tooltip */}
                    <AnimatePresence>
                        {hoveredButton === 'back' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -10, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50"
                            >
                                Go Back
                                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700 border-b-4 border-b-transparent" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div
                className="relative group"
                onMouseEnter={() => setHoveredButton('home')}
                onMouseLeave={() => setHoveredButton(null)}
            >
                <motion.button
                    onClick={handleHome}
                        className={cn(
                            buttonBaseClasses,
                            "bg-white/70 dark:bg-slate-800/70 border-green-200/60 dark:border-green-700/60",
                            "hover:bg-white/95 dark:hover:bg-slate-800/95",
                            "hover:border-green-400 dark:hover:border-green-500",
                            "hover:shadow-xl hover:shadow-green-500/30",
                            "active:scale-95",
                            "group-hover:scale-105"
                        )}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                        <Home className="w-5 h-5 text-green-600/80 dark:text-green-400/80 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    
                    {/* Ripple effect on hover */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-green-400/20"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                            scale: hoveredButton === 'home' ? 1.5 : 1,
                            opacity: hoveredButton === 'home' ? [0, 0.3, 0] : 0,
                        }}
                        transition={{ duration: 0.6 }}
                    />
                </motion.button>
                
                {/* Tooltip */}
                <AnimatePresence>
                    {hoveredButton === 'home' && (
                        <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50"
                        >
                            Go to Dashboard
                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700 border-b-4 border-b-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default NavigationButtons;
