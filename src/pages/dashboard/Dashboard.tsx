import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Trophy, Droplets, ThermometerSun, Zap, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Tooltip from '../../components/ui/Tooltip';
import { useAvatarStore } from '../../store/avatarStore';
import { useUserStore } from '../../store/userStore';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../config/api';

// Helper function to generate avatar URL from avatar ID
const getAvatarUrl = (avatarId: string | null): string => {
    if (!avatarId) {
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4&radius=20';
    }

    const styles = [
        'adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei',
        'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'shapes'
    ];
    const seeds = [
        'alex', 'blake', 'casey', 'dana', 'eli', 'finley',
        'gray', 'harper', 'ivy', 'jordan', 'kai', 'logan'
    ];

    const index = parseInt(avatarId.split('-')[1]) - 1;
    const style = styles[index] || 'avataaars';
    const seed = seeds[index] || 'default';

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=20`;
};

// Type definitions for API response
interface DashboardData {
    user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        created_at: string | null;
    };
    progress: {
        overall_progress: number;
        xp_level: number;
        stars: number;
        badges: number;
        total_xp: number;
    };
    modules: Array<{
        id: string;
        title: string;
        status: 'active' | 'locked';
        description: string;
    }>;
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string | null;
        unlocked: boolean;
        unlocked_at: string | null;
    }>;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { selectedAvatar } = useAvatarStore();
    const { userName, setUserName } = useUserStore();
    
    // State for dashboard data
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.warn('No access token found, redirecting to login');
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log('API: Fetching dashboard data');
                const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        navigate(ROUTES.AUTH.LOGIN);
                        return;
                    }
                    throw new Error(data.detail || 'Failed to fetch dashboard data');
                }

                console.log('API: Dashboard data fetched successfully', data);
                setDashboardData(data);
                
                // Update user store with name from API
                if (data.user?.name) {
                    setUserName(data.user.name);
                }
            } catch (err) {
                console.error('API: Dashboard fetch error', err);
                setError((err as Error).message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, setUserName]);

    // Use API data or fallback to store values
    const displayName = dashboardData?.user?.name || userName || 'User';
    // Priority: API avatar > Local store avatar > Default
    const avatarId = dashboardData?.user?.avatar || selectedAvatar;
    const avatarUrl = getAvatarUrl(avatarId);
    const modules = dashboardData?.modules || [
        {
            id: 'flood',
            title: 'Flood Module',
            icon: Droplets,
            status: 'active' as const,
            description: 'Learn about flood preparedness and safety',
        },
        {
            id: 'global-warming',
            title: 'Global Warming',
            icon: ThermometerSun,
            status: 'locked' as const,
            description: 'Understanding climate change',
        },
        {
            id: 'earthquake',
            title: 'Earthquake',
            icon: Zap,
            status: 'locked' as const,
            description: 'Earthquake safety and preparedness',
        },
    ];
    const progress = dashboardData?.progress || {
        overall_progress: 0,
        xp_level: 1,
        stars: 0,
        badges: 0,
        total_xp: 0,
    };
    const achievements = dashboardData?.achievements || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center max-w-md mx-auto p-6">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Welcome Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                        {/* Avatar with floating animation */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative"
                        >
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl ring-4 ring-blue-500/20 dark:ring-blue-400/20">
                                <img
                                    src={avatarUrl}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                                {/* Glow effect */}
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full"
                                />
                            </div>
                        </motion.div>

                        {/* Welcome Text */}
                        <div className="flex-1 text-center md:text-left">
                            <motion.h1
                                variants={itemVariants}
                                className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2"
                            >
                                Great to see you again, {displayName}! 👋
                            </motion.h1>
                            <motion.p
                                variants={itemVariants}
                                className="text-lg md:text-xl text-slate-600 dark:text-slate-400"
                            >
                                Ready to continue your resilience journey? Let's go! 🚀
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                        </div>

                        {/* Animated gradient overlay */}
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]"
                        />

                        <div className="relative z-10 space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.08, y: -2 }}
                                whileTap={{ scale: 0.96 }}
                                className="inline-block"
                            >
                                <motion.button
                                    onClick={() => {
                                        navigate(ROUTES.MODULES.FLOOD_INTRO);
                                    }}
                                    className="group relative w-full md:w-auto min-w-[300px] h-16 px-8 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden"
                                    animate={{
                                        boxShadow: [
                                            '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
                                            '0 25px 50px -12px rgba(147, 51, 234, 0.4), 0 10px 10px -5px rgba(147, 51, 234, 0.3)',
                                            '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    {/* Shine effect on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.6 }}
                                    />

                                    {/* Pulsing glow effect */}
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-xl"
                                        animate={{
                                            opacity: [0, 0.3, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />

                                    {/* Button content */}
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            <Droplets className="w-7 h-7" />
                                        </motion.div>
                                        <span>Start Flood Module</span>
                                        <motion.svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            animate={{
                                                x: [0, 4, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </motion.svg>
                                    </span>

                                    {/* Ripple effect on click */}
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-white/20"
                                        initial={{ scale: 0, opacity: 1 }}
                                        whileTap={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </motion.button>
                            </motion.div>
                            <motion.p
                                animate={{
                                    opacity: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="text-white/95 text-sm md:text-base font-medium"
                            >
                                Your first learning module.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Modules Section */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            📚 Learning Modules
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {modules.map((module, index) => {
                                // Map module IDs to icons
                                const iconMap: Record<string, typeof Droplets> = {
                                    'flood': Droplets,
                                    'global-warming': ThermometerSun,
                                    'earthquake': Zap,
                                };
                                const Icon = iconMap[module.id] || Droplets;
                                const isActive = module.status === 'active';
                                const isLocked = module.status === 'locked';

                                return (
                                    <motion.div
                                        key={module.id}
                                        variants={itemVariants}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={isActive ? { 
                                            scale: 1.05, 
                                            y: -8, 
                                            rotate: [0, 1, -1, 0],
                                            transition: { type: 'spring', stiffness: 300, damping: 20 }
                                        } : {}}
                                        className={cn(
                                            'relative rounded-3xl p-6 border-2 transition-all duration-300',
                                            isActive
                                                ? 'bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-400 shadow-xl hover:shadow-2xl cursor-pointer hover:border-blue-400'
                                                : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                        )}
                                    >
                                        {/* Glow effect for active card */}
                                        {isActive && (
                                            <motion.div
                                                animate={{
                                                    opacity: [0.3, 0.6, 0.3],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl -z-10"
                                            />
                                        )}

                                        {/* Lock overlay for locked modules */}
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-900/40 rounded-2xl flex items-center justify-center z-10">
                                                <Tooltip content="Available in next release" side="top">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Lock className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                            Locked
                                                        </span>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        )}

                                        {/* Coming Soon Ribbon for locked modules */}
                                        {isLocked && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg z-20">
                                                Coming Soon
                                            </div>
                                        )}

                                        {/* Module Content */}
                                        <div className="relative z-0">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div
                                                    className={cn(
                                                        'p-3 rounded-xl shadow-md',
                                                        isActive
                                                            ? 'bg-gradient-to-br from-blue-500 to-green-500'
                                                            : 'bg-slate-300 dark:bg-slate-600'
                                                    )}
                                                >
                                                    <Icon
                                                        className={cn(
                                                            'w-7 h-7',
                                                            isActive
                                                                ? 'text-white'
                                                                : 'text-slate-500 dark:text-slate-400'
                                                        )}
                                                    />
                                                </div>
                                                <h3
                                                    className={cn(
                                                        'text-xl font-bold',
                                                        isActive
                                                            ? 'text-slate-900 dark:text-slate-100'
                                                            : 'text-slate-500 dark:text-slate-400'
                                                    )}
                                                >
                                                    {module.title}
                                                </h3>
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-sm mb-4',
                                                    isActive
                                                        ? 'text-slate-600 dark:text-slate-400'
                                                        : 'text-slate-400 dark:text-slate-500'
                                                )}
                                            >
                                                {module.description}
                                            </p>
                                            {isActive && (
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        navigate(ROUTES.MODULES.FLOOD_INTRO);
                                                    }}
                                                >
                                                    🚀 Start Learning
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Progress Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-lg border-2 border-blue-200 dark:border-blue-700"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            📊 Your Progress
                        </h2>

                        {/* Progress Bar */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                    Overall Progress
                                </span>
                                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    {progress.overall_progress.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.overall_progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Gamified Elements */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {/* XP Level */}
                            <motion.div
                                whileHover={{ scale: 1.1, y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border-2 border-blue-200 dark:border-blue-700 cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">🎮 XP Level</div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{progress.xp_level}</div>
                            </motion.div>
                            {/* Progress Stars */}
                            <motion.div
                                whileHover={{ scale: 1.1, y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-4 border-2 border-yellow-200 dark:border-yellow-700 cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">⭐ Stars</div>
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{progress.stars}</div>
                            </motion.div>
                            {/* Badges */}
                            <motion.div
                                whileHover={{ scale: 1.1, y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 border-2 border-green-200 dark:border-green-700 cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">🏆 Badges</div>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{progress.badges}</div>
                            </motion.div>
                        </div>

                        {/* Achievements */}
                        <div>
                            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                🏅 Your Achievements
                            </h3>
                            <div className="flex gap-4">
                                {achievements.length > 0 ? (
                                    achievements.map((achievement, index) => (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.15, y: -5, rotate: [0, 5, -5, 0] }}
                                            className="flex flex-col items-center gap-2 cursor-pointer"
                                        >
                                            <motion.div
                                                animate={achievement.unlocked ? {
                                                    y: [0, -5, 0],
                                                    rotate: [0, 5, -5, 0],
                                                } : {}}
                                                transition={{
                                                    duration: 2,
                                                    repeat: achievement.unlocked ? Infinity : 0,
                                                    ease: 'easeInOut',
                                                }}
                                                className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg",
                                                    achievement.unlocked
                                                        ? "bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-600 border-yellow-400 dark:border-yellow-500"
                                                        : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 opacity-60 border-slate-300 dark:border-slate-600"
                                                )}
                                            >
                                                <Trophy className={cn(
                                                    "w-8 h-8",
                                                    achievement.unlocked
                                                        ? "text-yellow-600 dark:text-yellow-400"
                                                        : "text-slate-400 dark:text-slate-500"
                                                )} />
                                            </motion.div>
                                            <span className={cn(
                                                "text-xs font-medium text-center max-w-[80px]",
                                                achievement.unlocked
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : "text-slate-500 dark:text-slate-400"
                                            )}>
                                                {achievement.unlocked ? achievement.name : '🔒 Locked'}
                                            </span>
                                        </motion.div>
                                    ))
                                ) : (
                                    [1, 2, 3].map((index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center opacity-60 border-2 border-slate-300 dark:border-slate-600">
                                            <Trophy className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            🔒 Locked
                                        </span>
                                    </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

