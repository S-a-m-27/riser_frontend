import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw, Sparkles, Loader2, AlertTriangle, Volume2, Pause, Play, VolumeX } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { useConfetti } from '../../hooks/useConfetti';
import { playSuccess, playFail, playLevelUp } from '../../utils/sound';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { playRepeatedTTS, isTTSSupported, isSpeechSpeaking, stopSpeech, pauseSpeech, resumeSpeech, isSpeechPaused } from '../../utils/repeatTTS';
import { API_BASE_URL } from '../../config/api';

// API Response Types
interface AttemptAnswerDetail {
    question_id: string;
    question_text: string;
    selected_option_id: string | null;
    selected_option_text: string | null;
    correct_option_id: string | null;
    correct_option_text: string | null;
    is_correct: boolean;
    points_earned: number;
}

interface QuizAttemptDetail {
    id: string;
    quiz_id: string;
    quiz_title: string;
    lesson_id: string;  // Added for retake functionality
    score: number;
    total_questions: number;
    correct_answers: number;
    passed: boolean;
    started_at: string;
    completed_at: string | null;
    answers: AttemptAnswerDetail[];
}

// Radial Progress Component
interface RadialProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

const RadialProgress: React.FC<RadialProgressProps> = ({
    percentage,
    size = 200,
    strokeWidth = 12,
    color = '#3b82f6',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="drop-shadow-lg"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold" style={{ color }}>
                        {Math.round(percentage)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

const FloodQuizResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { triggerBurst } = useConfetti(true);
    const { stop } = useTextToSpeech();
    
    // State
    const [attemptDetail, setAttemptDetail] = useState<QuizAttemptDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const attemptId = searchParams.get('attempt_id');

    // Fetch attempt detail from API
    useEffect(() => {
        const fetchAttemptDetail = async () => {
            if (!attemptId) {
                setError('No attempt ID provided');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.warn('No access token found, redirecting to login');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }

                console.log('API: Fetching attempt detail', { attempt_id: attemptId });
                const response = await fetch(`${API_BASE_URL}/api/quizzes/attempts/${attemptId}`, {
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
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch attempt details');
                }

                const data: QuizAttemptDetail = await response.json();
                console.log('API: Attempt detail fetched successfully', data);
                
                setAttemptDetail(data);
                
            } catch (err) {
                console.error('API: Attempt detail fetch error', err);
                setError((err as Error).message || 'Failed to load quiz results');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttemptDetail();
    }, [attemptId, navigate]);

    // Fetch AI feedback when attempt detail is loaded
    useEffect(() => {
        const fetchAIFeedback = async () => {
            if (!attemptId || !attemptDetail) return;

            setIsLoadingFeedback(true);
            setFeedbackError(null);

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    return;
                }

                console.log('API: Fetching AI feedback', { attempt_id: attemptId });
                const response = await fetch(`${API_BASE_URL}/api/quizzes/attempts/${attemptId}/feedback`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch AI feedback');
                }

                const data = await response.json();
                console.log('API: AI feedback fetched successfully', data);
                
                if (data.feedback) {
                    setAiFeedback(data.feedback);
                } else if (data.error) {
                    setFeedbackError(data.error);
                }
                
            } catch (err) {
                console.error('API: AI feedback fetch error', err);
                setFeedbackError((err as Error).message || 'Failed to load AI feedback');
            } finally {
                setIsLoadingFeedback(false);
            }
        };

        fetchAIFeedback();
    }, [attemptId, attemptDetail]);

    // Poll speech status to update UI
    useEffect(() => {
        if (!isTTSSupported()) return;

        const interval = setInterval(() => {
            const speaking = isSpeechSpeaking();
            const paused = isSpeechPaused();
            setIsPlaying(speaking && !paused);
            setIsPaused(paused);
        }, 100); // Check every 100ms

        return () => clearInterval(interval);
    }, []);

    // Auto-play AI feedback once when it becomes available
    useEffect(() => {
        // Don't start new speech if speech is already playing or if muted
        if (isSpeechSpeaking() || isMuted) {
            if (isMuted) {
                console.log('[QuizResult] Speech muted, skipping auto-play');
            } else {
                console.log('[QuizResult] Speech already playing, skipping auto-play');
            }
            return;
        }

        if (aiFeedback && isTTSSupported()) {
            // Small delay to ensure UI is ready
            const timer = setTimeout(() => {
                // Double-check speech isn't playing and not muted before starting
                if (!isSpeechSpeaking() && !isMuted) {
                    setIsPlaying(true);
                    // Play only once instead of repeating
                    playRepeatedTTS(aiFeedback, 1, 0)
                        .then(() => {
                            setIsPlaying(false);
                            setIsPaused(false);
                        })
                        .catch((err) => {
                            console.warn('Failed to play TTS:', err);
                            setIsPlaying(false);
                            setIsPaused(false);
                        });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [aiFeedback, isMuted]);

    // Calculate percentage
    const percentage = attemptDetail ? attemptDetail.score : 0;

    // Animated score counter
    const scoreCount = useMotionValue(0);
    const roundedScore = useTransform(scoreCount, (latest) => Math.round(latest));
    const [displayScore, setDisplayScore] = useState(0);
    const hasAnimated = useRef(false);
    const animationIdRef = useRef<string | null>(null);

    // Subscribe to motion value changes
    useMotionValueEvent(roundedScore, 'change', (latest) => {
        setDisplayScore(Math.round(latest));
    });

    // Trigger confetti and sound on mount if score is good - only once per attempt
    useEffect(() => {
        if (!attemptDetail) return;
        
        // Check if this is a new attempt
        if (attemptDetail.id !== animationIdRef.current) {
            animationIdRef.current = attemptDetail.id;
            hasAnimated.current = false;
        }
        
        // Only animate if we haven't animated this attempt yet
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            
            // Set initial display score
            setDisplayScore(0);
            
            // Reset and animate score counting
            scoreCount.set(0);
            const controls = animate(scoreCount, percentage, {
                duration: 1.5,
                ease: 'easeOut',
            });

            // Play sounds based on result (only once)
            if (percentage >= 70) {
                triggerBurst();
                playSuccess();
                playLevelUp();
            } else {
                playFail();
            }

            return () => {
                controls.stop();
            };
        } else {
            // If already animated, just set the final score
            setDisplayScore(percentage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptDetail?.id, percentage]);

    // Stop speech when navigating away from quiz results page
    useEffect(() => {
        // Check if we're still on the quiz results page
        // The quiz results route is /quiz/flood/result
        const isOnQuizResultsPage = location.pathname === ROUTES.QUIZ.FLOOD_RESULT;
        
        // If we navigated away from quiz results page, stop speech immediately
        if (!isOnQuizResultsPage) {
            stop();
            stopSpeech();
        }
    }, [location.pathname, stop]);

    // Cleanup: stop speech when component unmounts
    useEffect(() => {
        return () => {
            // Stop both useTextToSpeech and playRepeatedTTS speech
            stop();
            stopSpeech();
        };
    }, [stop]);

    const scoreColor = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
    const scoreColorClass =
        percentage >= 70
            ? 'text-green-600 dark:text-green-400'
            : percentage >= 40
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400';

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-blue-600 dark:text-blue-400 text-lg">Loading results...</p>
            </div>
        );
    }

    // Error state
    if (error || !attemptDetail) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-900 p-4">
                <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Results</h2>
                <p className="text-red-700 dark:text-red-300 text-center mb-6">{error || 'No attempt data available'}</p>
                <Button onClick={() => navigate(ROUTES.QUIZ.FLOOD)} className="bg-red-600 hover:bg-red-700">
                    Back to Quiz
                </Button>
            </div>
        );
    }

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
        hidden: { opacity: 0, y: 30 },
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4 relative overflow-hidden">
            {/* Confetti Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {percentage >= 70 && [...Array(30)].map((_, i) => (
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
            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Page Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Quiz Results 🎉
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            Here's how you performed! Great work!
                        </p>
                    </motion.div>

                    {/* Score Summary Card */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-center"
                    >
                        <Card variant="elevated" className="w-full max-w-2xl overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    {/* Radial Progress */}
                                        <motion.div
                                            className="flex-shrink-0"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                        >
                                            <RadialProgress
                                                percentage={displayScore}
                                                size={200}
                                                strokeWidth={14}
                                                color={scoreColor}
                                            />
                                        </motion.div>

                                    {/* Score Details */}
                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <motion.div
                                                animate={{
                                                    y: [0, -8, 0],
                                                    rotate: [0, 10, -10, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                            >
                                                <Trophy
                                                    className={cn('w-10 h-10 md:w-12 md:h-12', scoreColorClass)}
                                                />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                                                    {displayScore}% Score
                                                </h2>
                                                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                                                    {attemptDetail.correct_answers} / {attemptDetail.total_questions} Correct 🎯
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-lg text-slate-600 dark:text-slate-400">
                                            {percentage >= 70
                                                ? '🎉 Amazing work! You really understand how to stay safe during floods!'
                                                : percentage >= 40
                                                    ? '👍 Good effort! Keep practicing to become even better at flood safety!'
                                                    : "💪 Don't worry! Every try helps you learn. You're getting better!"}
                                        </p>
                                        {attemptDetail.passed ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-2xl font-semibold shadow-lg"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                🏆 You Passed! Great Job!
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-2xl font-semibold shadow-lg"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                Try Again — You're Learning! 💪
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Question Breakdown Section */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            📚 Question Breakdown
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {attemptDetail.answers.map((answer, index) => (
                                <motion.div
                                    key={answer.question_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="transition-all duration-300"
                                >
                                    <Card
                                        variant="outline"
                                        className={cn(
                                            'border-2 transition-all duration-300',
                                            answer.is_correct
                                                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                                                : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                        )}
                                    >
                                        <CardContent className="p-5 md:p-6">
                                            <div className="space-y-4">
                                                {/* Question Header */}
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={cn(
                                                            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                                            answer.is_correct
                                                                ? 'bg-green-500'
                                                                : 'bg-red-500'
                                                        )}
                                                    >
                                                        {answer.is_correct ? (
                                                            <CheckCircle className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <XCircle className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                                            Question {index + 1}
                                                        </div>
                                                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                            {answer.question_text}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Answers */}
                                                <div className="space-y-3 pl-14">
                                                    {/* User Answer */}
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                            Your Answer:
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'text-sm md:text-base p-3 rounded-lg',
                                                                answer.is_correct
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                            )}
                                                        >
                                                            {answer.selected_option_text || 'No answer selected'}
                                                        </div>
                                                    </div>

                                                    {/* Correct Answer (only show if incorrect) */}
                                                    {!answer.is_correct && answer.correct_option_text && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                                Correct Answer:
                                                            </div>
                                                            <div className="text-sm md:text-base p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                                                {answer.correct_option_text}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Feedback Section */}
                    <motion.div variants={itemVariants}>
                        <Card variant="outline" className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                            <CardContent className="p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                ✨ Personalized Learning Feedback
                                            </h3>
                                            {aiFeedback && isTTSSupported() && (
                                                <div className="flex items-center gap-2">
                                                    {/* Pause/Resume Button */}
                                                    {isPlaying ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                pauseSpeech();
                                                                setIsPaused(true);
                                                                setIsPlaying(false);
                                                            }}
                                                            className="px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                            title="Pause speech"
                                                        >
                                                            <Pause className="w-4 h-4" />
                                                        </motion.button>
                                                    ) : isPaused ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                resumeSpeech();
                                                                setIsPaused(false);
                                                                setIsPlaying(true);
                                                            }}
                                                            className="px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                            title="Resume speech"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </motion.button>
                                                    ) : null}
                                                    
                                                    {/* Mute/Unmute Button */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            if (isMuted) {
                                                                setIsMuted(false);
                                                                // If speech was paused, resume it
                                                                if (isPaused) {
                                                                    resumeSpeech();
                                                                    setIsPaused(false);
                                                                    setIsPlaying(true);
                                                                }
                                                            } else {
                                                                setIsMuted(true);
                                                                // Stop current speech
                                                                stopSpeech();
                                                                setIsPlaying(false);
                                                                setIsPaused(false);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2",
                                                            isMuted 
                                                                ? "bg-red-500 hover:bg-red-600 text-white"
                                                                : "bg-slate-500 hover:bg-slate-600 text-white"
                                                        )}
                                                        title={isMuted ? "Unmute speech" : "Mute speech"}
                                                    >
                                                        {isMuted ? (
                                                            <VolumeX className="w-4 h-4" />
                                                        ) : (
                                                            <Volume2 className="w-4 h-4" />
                                                        )}
                                                    </motion.button>
                                                    
                                                    {/* Play/Hear Again Button */}
                                                    {!isPlaying && !isPaused && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                if (isMuted) {
                                                                    setIsMuted(false);
                                                                }
                                                                // Cancel any ongoing speech and start playback once
                                                                stopSpeech();
                                                                setIsPlaying(true);
                                                                setIsPaused(false);
                                                                playRepeatedTTS(aiFeedback, 1, 0)
                                                                    .then(() => {
                                                                        setIsPlaying(false);
                                                                        setIsPaused(false);
                                                                    })
                                                                    .catch((err) => {
                                                                        console.warn('Failed to play TTS:', err);
                                                                        setIsPlaying(false);
                                                                        setIsPaused(false);
                                                                    });
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                            title="Hear feedback again"
                                                        >
                                                            <Volume2 className="w-5 h-5" />
                                                            <span className="text-sm font-medium">🔊 Hear Again</span>
                                                        </motion.button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isLoadingFeedback ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Generating personalized feedback...</span>
                                                </div>
                                                {/* Shimmer animation */}
                                                <div className="relative overflow-hidden rounded-lg">
                                                    <motion.div
                                                        animate={{
                                                            backgroundPosition: ['200% 0', '-200% 0'],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                        className="h-20 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]"
                                                    />
                                                </div>
                                            </div>
                                        ) : feedbackError ? (
                                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    {feedbackError}
                                                </p>
                                            </div>
                                        ) : aiFeedback ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                            >
                                                <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                                    {aiFeedback.split('\n').map((paragraph, index) => (
                                                        <p key={index} className="mb-3 last:mb-0">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <p className="text-slate-600 dark:text-slate-400">
                                                AI feedback is currently unavailable.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                onClick={() => navigate(ROUTES.MISINFO)}
                                className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🚀 Continue Your Journey
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => {
                                    const lessonId = attemptDetail?.lesson_id || 'flood-5min-baseline';
                                    navigate(`${ROUTES.QUIZ.FLOOD}?lesson_id=${lessonId}`);
                                }}
                                className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 rounded-2xl"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5" />
                                    🔄 Try Again
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FloodQuizResult;
