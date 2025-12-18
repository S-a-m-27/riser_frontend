import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
    Trophy,
    FileText,
    Puzzle,
    Play,
    Award,
    ArrowLeft,
    TrendingUp,
    CheckCircle,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

import { API_BASE_URL } from '../../config/api';
import { playRepeatedTTS, isTTSSupported, isSpeechSpeaking } from '../../utils/repeatTTS';

// API Types
interface ScoreBreakdown {
    quiz: number;
    puzzle: number;
    simulation: number;
}

interface BadgeInfo {
    name: string;
    description: string;
}

interface AISummary {
    insights: string[];
}

interface FinalResultsData {
    overallScore: number;
    maxScore: number;
    breakdown: ScoreBreakdown;
    badge: BadgeInfo;
    aiSummary: AISummary;
}

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    React.useEffect(() => {
        const controls = animate(count, value, {
            duration,
            ease: 'easeOut',
        });
        return controls.stop;
    }, [value, count, duration]);

    return <motion.span>{rounded}</motion.span>;
};

// Circular Progress Component
interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    size = 200,
    strokeWidth = 12,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200 dark:text-slate-700"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        <AnimatedCounter value={percentage} />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">/100</div>
                </div>
            </div>
        </div>
    );
};

const FinalResults: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resultData, setResultData] = useState<FinalResultsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFinalResults();
    }, [searchParams]);

    const fetchFinalResults = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            const module = searchParams.get('module') || 'flood';
            const url = `${API_BASE_URL}/api/results/final?module=${module}`;
            console.log('[FinalResults API] Base URL:', API_BASE_URL);
            console.log('[FinalResults API] Full URL:', url);

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
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || `Failed to fetch final results (${response.status})`);
            }

            const data: FinalResultsData = await response.json();
            setResultData(data);
            
            // Auto-play AI summary with repetition when it becomes available
            if (data.aiSummary?.insights && isTTSSupported() && !isSpeechSpeaking()) {
                const summaryText = data.aiSummary.insights.join('. ');
                // Small delay to ensure UI is ready
                setTimeout(() => {
                    // Double-check speech isn't playing before starting
                    if (!isSpeechSpeaking()) {
                        playRepeatedTTS(summaryText, 2, 1200).catch((err) => {
                            console.warn('Failed to play repeated TTS:', err);
                        });
                    }
                }, 1000);
            }
        } catch (err) {
            console.error('Error fetching final results:', err);
            setError((err as Error).message || 'Failed to load final results');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-600 dark:text-slate-400">Loading your results...</p>
                </div>
            </div>
        );
    }

    if (error || !resultData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <Card variant="elevated" className="max-w-md">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Error Loading Results</h2>
                        <p className="text-slate-600 dark:text-slate-400">{error || 'No results data available'}</p>
                        <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const weightedScore = Math.round(resultData.overallScore);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4 relative overflow-hidden">
            {/* Celebration Confetti */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(40)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            y: -100,
                            x: Math.random() * window.innerWidth,
                            opacity: 1,
                            rotate: 0
                        }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: 0,
                            rotate: 360
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            delay: Math.random() * 0.5,
                            repeat: Infinity,
                            repeatDelay: 3,
                        }}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                            backgroundColor: ['#3B82F6', '#10B981', '#FACC15', '#FB923C'][Math.floor(Math.random() * 4)],
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>
            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Final Score Banner */}
                    <motion.div variants={itemVariants} className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CircularProgress percentage={resultData.overallScore} size={200} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
                                You're Becoming a Resilience Hero! 🦸
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                                Your Resilience Score: <span className="font-bold text-blue-600 dark:text-blue-400"><AnimatedCounter value={resultData.overallScore} />/{resultData.maxScore}</span>
                            </p>
                            <p className="text-base text-slate-500 dark:text-slate-400">
                                Amazing work completing all tasks! 🌟
                            </p>
                        </div>
                    </motion.div>

                    {/* Score Breakdown Section */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Score Breakdown
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Quiz Score */}
                            <Card variant="elevated" className="h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Quiz Score
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                        <AnimatedCounter value={resultData.breakdown.quiz} />
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${resultData.breakdown.quiz}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r',
                                                getScoreColor(resultData.breakdown.quiz)
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Puzzle Score */}
                            <Card variant="elevated" className="h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                            <Puzzle className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Puzzle Score
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                        <AnimatedCounter value={resultData.breakdown.puzzle} />
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${resultData.breakdown.puzzle}%` }}
                                            transition={{ duration: 1, delay: 0.4 }}
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r',
                                                getScoreColor(resultData.breakdown.puzzle)
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Simulation Score */}
                            <Card variant="elevated" className="h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Simulation Score
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                        <AnimatedCounter value={resultData.breakdown.simulation} />
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${resultData.breakdown.simulation}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r',
                                                getScoreColor(resultData.breakdown.simulation)
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Overall Weighted Score */}
                            <Card variant="elevated" className="h-full border-2 border-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Overall Score
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                        <AnimatedCounter value={weightedScore} />
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${weightedScore}%` }}
                                            transition={{ duration: 1, delay: 0.6 }}
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r',
                                                getScoreColor(weightedScore)
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Badge Earned */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-center"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative"
                        >
                            <Card
                                variant="elevated"
                                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 shadow-2xl"
                            >
                                <CardContent className="p-8 md:p-12 text-center">
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                '0 0 20px rgba(234, 179, 8, 0.3)',
                                                '0 0 40px rgba(234, 179, 8, 0.5)',
                                                '0 0 20px rgba(234, 179, 8, 0.3)',
                                            ],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <Award className="w-12 h-12 md:w-16 md:h-16 text-white" />
                                    </motion.div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        {resultData.badge.name}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {resultData.badge.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* AI Final Summary */}
                    <motion.div variants={itemVariants}>
                        <Card variant="elevated">
                            <CardHeader>
                                <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                    Your Learning Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Based on your performance across all activities, here are key insights:
                                    </p>
                                    {resultData.aiSummary?.insights && isTTSSupported() && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                const summaryText = resultData.aiSummary.insights.join('. ');
                                                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                                    window.speechSynthesis.cancel();
                                                }
                                                playRepeatedTTS(summaryText, 2, 1200).catch((err) => {
                                                    console.warn('Failed to play repeated TTS:', err);
                                                });
                                            }}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 flex-shrink-0"
                                            title="Hear summary again (plays twice)"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                            <span className="text-sm font-medium">🔊 Hear Again</span>
                                        </motion.button>
                                    )}
                                </div>
                                <ul className="space-y-3">
                                    {resultData.aiSummary.insights.map((insight, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {insight}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                onClick={() => navigate(ROUTES.RESULTS.CERTIFICATE)}
                                className="w-full sm:w-auto min-w-[200px] h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Get Certificate
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate(ROUTES.LEADERBOARD)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    View Leaderboard
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate(ROUTES.DASHBOARD)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Dashboard
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FinalResults;

