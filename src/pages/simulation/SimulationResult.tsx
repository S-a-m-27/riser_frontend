import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Shield,
    Zap,
    RotateCcw,
    ArrowRight,
    TrendingUp,
    Users,
    Target,
    Clock,
    FileText,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Volume2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../router/routeMap';
import { playAchievement, playFail, playLevelUp } from '../../utils/sound';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { useConfetti } from '../../hooks/useConfetti';

import { API_BASE_URL } from '../../config/api';
import { playRepeatedTTS, isTTSSupported, isSpeechSpeaking } from '../../utils/repeatTTS';

// API Types - Updated to match new backend format
interface SimulationScores {
    preparedness: number;
    response: number;
    recovery: number;
    riskRecognition: number;
}

interface SimulationMetrics {
    teamMorale: number;
    stressLevel: number;
    alignment: number;
    timeBonus: number;
}

interface SimulationSummary {
    title: string;
    subtitle: string;
}

interface SimulationResult {
    success: boolean;
    scores: SimulationScores;
    metrics: SimulationMetrics;
    summary: SimulationSummary;
}

interface ResilienceScore {
    title: string;
    score: number;
    icon: React.ComponentType<{ className?: string }>;
}

const SimulationResult: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resultData, setResultData] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { triggerBurst } = useConfetti(true);
    
    // Animated score counters
    const scoreCounters = {
        preparedness: useMotionValue(0),
        response: useMotionValue(0),
        recovery: useMotionValue(0),
        riskRecognition: useMotionValue(0),
    };
    
    const roundedScores = {
        preparedness: useTransform(scoreCounters.preparedness, (latest) => Math.round(latest)),
        response: useTransform(scoreCounters.response, (latest) => Math.round(latest)),
        recovery: useTransform(scoreCounters.recovery, (latest) => Math.round(latest)),
        riskRecognition: useTransform(scoreCounters.riskRecognition, (latest) => Math.round(latest)),
    };

    useEffect(() => {
        const sessionId = searchParams.get('session_id') || localStorage.getItem('simulation_session_id');

        if (sessionId) {
            fetchResult(sessionId);
        } else {
            setError('No simulation session found');
            setIsLoading(false);
        }
    }, [searchParams]);

    const fetchResult = async (sessionId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching simulation result for session:', sessionId);
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            const url = `${API_BASE_URL}/simulation/result/${sessionId}`;
            console.log('Fetching from URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                console.error('Error response:', errorData);
                throw new Error(errorData.detail || `Failed to fetch simulation result (${response.status})`);
            }

            const data: SimulationResult = await response.json();
            console.log('Result data received:', data);
            
            // Validate data structure
            if (!data || !data.scores || !data.metrics) {
                console.error('Invalid data structure:', data);
                throw new Error('Invalid response format from server');
            }
            
            setResultData(data);
            
            // Auto-play summary with repetition when it becomes available
            if (data.summary && isTTSSupported() && !isSpeechSpeaking()) {
                const summaryText = `${data.summary.title}. ${data.summary.subtitle || ''}`;
                // Small delay to ensure UI is ready
                setTimeout(() => {
                    // Double-check speech isn't playing before starting
                    if (!isSpeechSpeaking()) {
                        playRepeatedTTS(summaryText, 2, 1200).catch((err) => {
                            console.warn('Failed to play repeated TTS:', err);
                        });
                    }
                }, 1500);
            }
            
            // Animate score counting and play sounds
            setTimeout(() => {
                if (data.success) {
                    triggerBurst();
                    playAchievement();
                    playLevelUp();
                } else {
                    playFail();
                }
                
                // Animate all scores
                Object.keys(scoreCounters).forEach((key) => {
                    const scoreKey = key as keyof typeof scoreCounters;
                    const targetScore = data.scores[scoreKey];
                    animate(scoreCounters[scoreKey], targetScore, {
                        duration: 1.5,
                        ease: 'easeOut',
                    });
                });
            }, 300);

        } catch (err) {
            console.error('Error fetching result:', err);
            setError((err as Error).message || 'Failed to load simulation result');
        } finally {
            setIsLoading(false);
        }
    };

    // Use scores directly from backend (no calculation needed)
    const scores = resultData?.scores || null;
    const metrics = resultData?.metrics || null;
    const isSuccessful = resultData?.success || false;

    const resilienceScores: ResilienceScore[] = scores ? [
        {
            title: 'Preparedness Score',
            score: scores.preparedness,
            icon: Shield,
        },
        {
            title: 'Response Score',
            score: scores.response,
            icon: Zap,
        },
        {
            title: 'Recovery Score',
            score: scores.recovery,
            icon: RotateCcw,
        },
        {
            title: 'Risk Recognition Score',
            score: scores.riskRecognition,
            icon: Target,
        },
    ] : [];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Loading results...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !resultData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Results</h2>
                    <p className="text-red-700 dark:text-red-300 mb-6">{error || 'No result data available'}</p>
                    <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Outcome Banner */}
                    <motion.div variants={itemVariants}>
                        <Card
                            variant="elevated"
                            className={cn(
                                'overflow-hidden border-2',
                                isSuccessful
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
                            )}
                        >
                            <CardContent className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className={cn(
                                            'flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center',
                                            isSuccessful
                                                ? 'bg-green-500'
                                                : 'bg-red-500'
                                        )}
                                    >
                                        {isSuccessful ? (
                                            <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                        ) : (
                                            <XCircle className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <h1
                                            className={cn(
                                                'text-3xl md:text-4xl lg:text-5xl font-bold mb-2',
                                                isSuccessful
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : 'text-yellow-700 dark:text-yellow-300'
                                            )}
                                        >
                                            {resultData?.summary?.title || (isSuccessful
                                                ? '🎉 You Completed the Simulation!'
                                                : '💪 Keep Practicing — You\'re Learning!')}
                                        </h1>
                                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                                            {resultData?.summary?.subtitle || (isSuccessful
                                                ? 'Amazing work! Here\'s how you did!'
                                                : 'Every try makes you better! Here\'s what you learned.')}
                                        </p>
                                        {resultData?.summary && isTTSSupported() && (
                                            <div className="mt-4 flex justify-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        const summaryText = `${resultData.summary.title}. ${resultData.summary.subtitle || ''}`;
                                                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                                            window.speechSynthesis.cancel();
                                                        }
                                                        playRepeatedTTS(summaryText, 2, 1200).catch((err) => {
                                                            console.warn('Failed to play repeated TTS:', err);
                                                        });
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                    title="Hear summary again (plays twice)"
                                                >
                                                    <Volume2 className="w-5 h-5" />
                                                    <span className="text-sm font-medium">🔊 Hear Again</span>
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Score Summary Box */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            🏆 Your Resilience Scores
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resilienceScores.map((score, index) => {
                                const Icon = score.icon;
                                return (
                                    <motion.div
                                        key={score.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card variant="elevated" className="h-full">
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                                <Icon className="w-6 h-6 text-white" />
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                                {score.title}
                                                            </h3>
                                                        </div>
                                                        {score.title === 'Preparedness Score' && (
                                                            <motion.span
                                                                className={cn(
                                                                    'text-2xl font-bold',
                                                                    getScoreColor(score.score)
                                                                )}
                                                            >
                                                                {roundedScores.preparedness}
                                                            </motion.span>
                                                        )}
                                                        {score.title === 'Response Score' && (
                                                            <motion.span
                                                                className={cn(
                                                                    'text-2xl font-bold',
                                                                    getScoreColor(score.score)
                                                                )}
                                                            >
                                                                {roundedScores.response}
                                                            </motion.span>
                                                        )}
                                                        {score.title === 'Recovery Score' && (
                                                            <motion.span
                                                                className={cn(
                                                                    'text-2xl font-bold',
                                                                    getScoreColor(score.score)
                                                                )}
                                                            >
                                                                {roundedScores.recovery}
                                                            </motion.span>
                                                        )}
                                                        {score.title === 'Risk Recognition Score' && (
                                                            <motion.span
                                                                className={cn(
                                                                    'text-2xl font-bold',
                                                                    getScoreColor(score.score)
                                                                )}
                                                            >
                                                                {roundedScores.riskRecognition}
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${score.score}%` }}
                                                                transition={{
                                                                    duration: 1,
                                                                    delay: index * 0.1 + 0.3,
                                                                    ease: 'easeOut',
                                                                }}
                                                                className={cn(
                                                                    'h-full rounded-full bg-gradient-to-r',
                                                                    getProgressColor(score.score)
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                            {score.score >= 80
                                                                ? '🌟 Excellent!'
                                                                : score.score >= 60
                                                                    ? '👍 Good Job!'
                                                                    : '💪 Keep Learning!'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Additional Metrics */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Additional Metrics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Team Morale */}
                            <Card variant="outline">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-8 h-8 text-green-500" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Team Morale
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                        {metrics?.teamMorale || 0}%
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metrics?.teamMorale || 0}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stress Level */}
                            <Card variant="outline">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp className="w-8 h-8 text-red-500" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Stress Level
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                                        {metrics?.stressLevel || 0}%
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metrics?.stressLevel || 0}%` }}
                                            transition={{ duration: 1, delay: 0.6 }}
                                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alignment Score */}
                            <Card variant="outline">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="w-8 h-8 text-blue-500" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Alignment Score
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                        {metrics?.alignment || 0}%
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scores?.riskRecognition || 0}%` }}
                                            transition={{ duration: 1, delay: 0.7 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time Bonus */}
                            <Card variant="outline">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock className="w-8 h-8 text-purple-500" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Time Bonus
                                        </h3>
                                    </div>
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        +{metrics?.timeBonus || 0}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        Points earned for completing quickly
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* AI Summary Section */}
                    <motion.div variants={itemVariants}>
                        <Card variant="elevated">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                    📊 Your Resilience Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-600 dark:text-slate-400 text-lg">
                                    Based on your amazing performance, here's what you did great:
                                </p>
                                <ul className="space-y-3">
                                    <motion.li
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300">
                                            🛡️ Preparedness: {scores?.preparedness || 0}/100 - {scores && scores.preparedness >= 80 ? '🌟 Excellent!' : scores && scores.preparedness >= 60 ? '👍 Good Job!' : '💪 Keep Learning!'}
                                        </span>
                                    </motion.li>
                                    <motion.li
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300">
                                            ⚡ Response: {scores?.response || 0}/100 - {scores && scores.response >= 80 ? '🌟 Excellent!' : scores && scores.response >= 60 ? '👍 Good Job!' : '💪 Keep Learning!'}
                                        </span>
                                    </motion.li>
                                    <motion.li
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.0 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300">
                                            🎯 Risk Recognition: {scores?.riskRecognition || 0}/100 - {scores && scores.riskRecognition >= 80 ? '🌟 Excellent!' : scores && scores.riskRecognition >= 60 ? '👍 Good Job!' : '💪 Keep Learning!'}
                                        </span>
                                    </motion.li>
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
                                variant="outline"
                                onClick={() => navigate(ROUTES.SIMULATION.REVIEW)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-5 h-5" />
                                    📋 Review Decisions
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
                                onClick={() => {
                                    localStorage.removeItem('simulation_session_id');
                                    navigate(ROUTES.SIMULATION.INTRO);
                                }}
                                className="w-full sm:w-auto min-w-[200px] h-12 rounded-2xl"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5" />
                                    🔄 Try Again
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
                                onClick={() => navigate(ROUTES.RESULTS.FINAL)}
                                className="w-full sm:w-auto min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl shadow-xl"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🚀 Continue Your Journey
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default SimulationResult;


