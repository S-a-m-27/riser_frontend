import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

import { API_BASE_URL } from '../../config/api';

interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    score: number;
    badge: 'Gold' | 'Silver' | 'Bronze' | 'Participant';
    avatar: string;
    isCurrentUser?: boolean;
}

interface LeaderboardResponse {
    users: LeaderboardUser[];
    total_users: number;
    module: string;
    sort_by: string;
}

const Leaderboard: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState('Flood');
    const [sortBy, setSortBy] = useState('Highest Score');
    const [showModuleFilter, setShowModuleFilter] = useState(false);
    const [showSortFilter, setShowSortFilter] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const moduleFilterRef = useRef<HTMLDivElement>(null);
    const sortFilterRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                moduleFilterRef.current &&
                !moduleFilterRef.current.contains(event.target as Node)
            ) {
                setShowModuleFilter(false);
            }
            if (
                sortFilterRef.current &&
                !sortFilterRef.current.contains(event.target as Node)
            ) {
                setShowSortFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch leaderboard data
    useEffect(() => {
        fetchLeaderboard();
    }, [selectedModule, sortBy]);

    const fetchLeaderboard = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please log in to view leaderboard');
                setIsLoading(false);
                return;
            }

            // Map frontend module names to backend module names
            const moduleMap: Record<string, string> = {
                'Flood': 'flood',
                'Earthquake': 'earthquake',
                'Global Warming': 'global_warming'
            };

            // Map frontend sort options to backend sort options
            const sortMap: Record<string, string> = {
                'Highest Score': 'highest_score',
                'Most Recent': 'most_recent'
            };

            const moduleParam = moduleMap[selectedModule] || 'flood';
            const sortParam = sortMap[sortBy] || 'highest_score';

            const url = `${API_BASE_URL}/api/leaderboard?module=${moduleParam}&sort_by=${sortParam}`;
            console.log('[Leaderboard API] Base URL:', API_BASE_URL);
            console.log('[Leaderboard API] Full URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    setError('Please log in to view leaderboard');
                    setIsLoading(false);
                    return;
                }
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || `Failed to fetch leaderboard (${response.status})`);
            }

            const data: LeaderboardResponse = await response.json();
            console.log('Leaderboard data received:', data);
            setLeaderboard(data.users || []);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError((err as Error).message || 'Failed to load leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);
    
    // Safety check: ensure topThree has at least 3 elements for podium display
    const hasTopThree = topThree.length >= 3;
    
    // If we have fewer than 3 users, show them all in the table instead of podium
    const showAllInTable = leaderboard.length > 0 && leaderboard.length < 3;
    const tableUsers = showAllInTable ? leaderboard : restOfLeaderboard;

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'Gold':
                return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
            case 'Silver':
                return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
            case 'Bronze':
                return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
            default:
                return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
        }
    };

    const getRankGlow = (rank: number) => {
        switch (rank) {
            case 1:
                return 'shadow-2xl shadow-yellow-500/50 ring-4 ring-yellow-500/30';
            case 2:
                return 'shadow-2xl shadow-slate-400/50 ring-4 ring-slate-400/30';
            case 3:
                return 'shadow-2xl shadow-orange-500/50 ring-4 ring-orange-500/30';
            default:
                return '';
        }
    };

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
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    const podiumVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Page Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-4">
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-block mb-4"
                        >
                            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-500" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
                            Leaderboard
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            See how you rank among other learners.
                        </p>
                    </motion.div>

                    {/* Filters */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Module Filter */}
                        <div className="relative" ref={moduleFilterRef}>
                            <button
                                onClick={() => {
                                    setShowModuleFilter(!showModuleFilter);
                                    setShowSortFilter(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Filter by Module: {selectedModule}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'w-4 h-4 text-slate-500 transition-transform',
                                        showModuleFilter && 'rotate-180'
                                    )}
                                />
                            </button>
                            {showModuleFilter && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                    {['Flood', 'Earthquake', 'Global Warming'].map((module) => (
                                        <button
                                            key={module}
                                            onClick={() => {
                                                setSelectedModule(module);
                                                setShowModuleFilter(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                                        >
                                            {module}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Filter */}
                        <div className="relative" ref={sortFilterRef}>
                            <button
                                onClick={() => {
                                    setShowSortFilter(!showSortFilter);
                                    setShowModuleFilter(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Sort by: {sortBy}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'w-4 h-4 text-slate-500 transition-transform',
                                        showSortFilter && 'rotate-180'
                                    )}
                                />
                            </button>
                            {showSortFilter && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                    {['Highest Score', 'Most Recent'].map((sort) => (
                                        <button
                                            key={sort}
                                            onClick={() => {
                                                setSortBy(sort);
                                                setShowSortFilter(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                                        >
                                            {sort}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Loading State */}
                    {isLoading && (
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center justify-center py-12 space-y-4"
                        >
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                            <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center justify-center py-12 space-y-4"
                        >
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {/* Leaderboard Content - Only show if not loading and no error */}
                    {!isLoading && !error && leaderboard.length === 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="text-center py-12"
                        >
                            <p className="text-slate-600 dark:text-slate-400">
                                No leaderboard data available for {selectedModule} module yet.
                            </p>
                        </motion.div>
                    )}

                    {!isLoading && !error && leaderboard.length > 0 && (
                        <>

                            {/* Top 3 Podium Section */}
                            {hasTopThree && (
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 px-4"
                                >
                                    {/* 2nd Place */}
                                    <motion.div
                                        variants={podiumVariants}
                                        className="flex-1 max-w-[200px] order-2 md:order-1"
                                    >
                                        <Card
                                            variant="elevated"
                                            className={cn(
                                                'text-center overflow-hidden',
                                                getRankGlow(2)
                                            )}
                                        >
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-center">
                                                    <Medal className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <div className="relative">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-slate-300 mx-auto shadow-lg">
                                                        <img
                                                            src={topThree[1]?.avatar || ''}
                                                            alt={topThree[1]?.name || '2nd Place'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        2
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                                        {topThree[1]?.name || 'N/A'}
                                                    </h3>
                                                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                                                        {topThree[1]?.score || 0}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* 1st Place */}
                                    <motion.div
                                        variants={podiumVariants}
                                        className="flex-1 max-w-[240px] order-1 md:order-2"
                                    >
                                        <Card
                                            variant="elevated"
                                            className={cn(
                                                'text-center overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
                                                getRankGlow(1)
                                            )}
                                        >
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-center">
                                                    <Medal className="w-10 h-10 text-yellow-500" />
                                                </div>
                                                    <div className="relative">
                                                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-yellow-400 mx-auto shadow-xl">
                                                            <img
                                                                src={topThree[0]?.avatar || ''}
                                                                alt={topThree[0]?.name || '1st Place'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                                            1
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                                            {topThree[0]?.name || 'N/A'}
                                                        </h3>
                                                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                                            {topThree[0]?.score || 0}
                                                        </p>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* 3rd Place */}
                                    <motion.div
                                        variants={podiumVariants}
                                        className="flex-1 max-w-[200px] order-3"
                                    >
                                        <Card
                                            variant="elevated"
                                            className={cn(
                                                'text-center overflow-hidden',
                                                getRankGlow(3)
                                            )}
                                        >
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-center">
                                                    <Medal className="w-8 h-8 text-orange-400" />
                                                </div>
                                                    <div className="relative">
                                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-orange-300 mx-auto shadow-lg">
                                                            <img
                                                                src={topThree[2]?.avatar || ''}
                                                                alt={topThree[2]?.name || '3rd Place'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            3
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                                            {topThree[2]?.name || 'N/A'}
                                                        </h3>
                                                        <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                                                            {topThree[2]?.score || 0}
                                                        </p>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Full Leaderboard Table */}
                            <motion.div variants={itemVariants}>
                        <Card variant="elevated">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    {/* Desktop Table */}
                                    <table className="w-full hidden md:table">
                                        <thead className="bg-slate-100 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Rank
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Player
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Score
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Badge
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                    className={cn(
                                                        'border-b border-slate-200 dark:border-slate-700 transition-colors',
                                                        user.isCurrentUser &&
                                                        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                    )}
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="text-lg font-bold text-slate-600 dark:text-slate-400">
                                                            #{user.rank}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                        {user.name}
                                                                    </span>
                                                                    {user.isCurrentUser && (
                                                                        <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                                                            You
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                            {user.score}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={cn(
                                                                'text-xs font-semibold px-3 py-1 rounded-full',
                                                                getBadgeColor(user.badge)
                                                            )}
                                                        >
                                                            {user.badge}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card List */}
                                    <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                                        {tableUsers.map((user, index) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02 }}
                                                className={cn(
                                                    'p-4',
                                                    user.isCurrentUser &&
                                                    'bg-blue-50 dark:bg-blue-900/20'
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-lg font-bold text-slate-600 dark:text-slate-400 w-8">
                                                            #{user.rank}
                                                        </span>
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                    {user.name}
                                                                </span>
                                                                {user.isCurrentUser && (
                                                                    <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                                                    {user.score}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                                                                        getBadgeColor(user.badge)
                                                                    )}
                                                                >
                                                                    {user.badge}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Leaderboard;

