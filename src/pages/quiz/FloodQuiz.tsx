import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Droplets, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { useSound } from '../../hooks/useSound';
import { API_BASE_URL } from '../../config/api';

// API Response Types
interface QuizOption {
    id: string;
    option_text: string;
    order: number;
}

interface QuizQuestion {
    id: string;
    question_text: string;
    order: number;
    points: number;
    options: QuizOption[];
}

interface QuizData {
    id: string;
    lesson_id: string;
    module: string;
    title: string;
    description: string | null;
    passing_score: number;
    questions: QuizQuestion[];
    created_at: string;
}

// User answer tracking
interface UserAnswer {
    question_id: string;
    selected_option_id: string | null;
}

const FloodQuiz: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { playCorrect } = useSound(true);
    
    // Quiz data state
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Quiz progress state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Get lesson_id from URL params or default to flood lesson
    const lessonId = searchParams.get('lesson_id') || 'flood-5min-baseline';

    // Fetch quiz data from API
    useEffect(() => {
        const fetchQuiz = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.warn('No access token found, redirecting to login');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }

                console.log('API: Fetching quiz for lesson_id:', lessonId);
                const response = await fetch(`${API_BASE_URL}/api/quizzes/lesson/${lessonId}`, {
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
                    throw new Error(errorData.detail || 'Failed to fetch quiz');
                }

                const data: QuizData = await response.json();
                console.log('API: Quiz fetched successfully', data);
                
                setQuizData(data);
                
                // Initialize user answers array
                const initialAnswers: UserAnswer[] = data.questions.map(q => ({
                    question_id: q.id,
                    selected_option_id: null,
                }));
                setUserAnswers(initialAnswers);
                
            } catch (err) {
                console.error('API: Quiz fetch error', err);
                setError((err as Error).message || 'Failed to load quiz');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [lessonId, navigate]);

    // Get current question
    const currentQuestion = quizData?.questions[currentQuestionIndex];
    const totalQuestions = quizData?.questions.length || 0;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const handleAnswerSelect = (optionId: string) => {
        if (selectedAnswer !== null || !currentQuestion) return; // Prevent re-selection

        setSelectedAnswer(optionId);
        
        // Update user answers
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = {
            question_id: currentQuestion.id,
            selected_option_id: optionId,
        };
        setUserAnswers(updatedAnswers);
        
        // Show feedback that answer was selected
        setShowFeedback(true);
        playCorrect();
    };

    const handleNextQuestion = async () => {
        if (isLastQuestion) {
            // Submit quiz
            await handleSubmitQuiz();
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quizData) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            console.log('API: Submitting quiz', { quiz_id: quizData.id, answers: userAnswers });
            
            const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizData.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: userAnswers,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit quiz');
            }

            const result = await response.json();
            console.log('API: Quiz submitted successfully', result);
            
            // Navigate to results page with quiz result data
            navigate(`${ROUTES.QUIZ.FLOOD_RESULT}?attempt_id=${result.attempt_id}&quiz_id=${result.quiz_id}`);
            
        } catch (err) {
            console.error('API: Quiz submission error', err);
            setError((err as Error).message || 'Failed to submit quiz');
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-blue-600 dark:text-blue-400 text-lg">Loading quiz...</p>
            </div>
        );
    }

    // Error state
    if (error && !quizData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-900 p-4">
                <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Quiz</h2>
                <p className="text-red-700 dark:text-red-300 text-center mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                    Try Again
                </Button>
            </div>
        );
    }

    // No quiz data
    if (!quizData || !currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <p className="text-slate-600 dark:text-slate-400">No quiz data available</p>
            </div>
        );
    }

    // Sort options by order
    const sortedOptions = currentQuestion.options.sort((a, b) => a.order - b.order);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const questionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            x: -20,
            transition: {
                duration: 0.3,
            },
        },
    };

    const optionVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4,
                ease: 'easeOut',
            },
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Error message for submission errors */}
                {error && quizData && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 rounded-xl"
                    >
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </motion.div>
                )}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 md:space-y-8"
                >
                    {/* Progress Bar Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex justify-between items-center text-sm md:text-base">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            variants={questionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Card variant="elevated" className="overflow-hidden">
                                <CardContent className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Droplets className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                                Question {currentQuestion.order}
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                                {currentQuestion.question_text}
                                            </h2>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Answer Options */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <AnimatePresence>
                            {sortedOptions.map((option, index) => {
                                const isSelected = selectedAnswer === option.id;

                                return (
                                    <motion.div
                                        key={option.id}
                                        custom={index}
                                        variants={optionVariants}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover={selectedAnswer === null ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                    >
                                        <button
                                            onClick={() => handleAnswerSelect(option.id)}
                                            disabled={selectedAnswer !== null || isSubmitting}
                                            className={cn(
                                                'w-full p-5 md:p-6 rounded-xl border-2 text-left transition-all duration-300',
                                                'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
                                                'disabled:cursor-not-allowed',
                                                selectedAnswer === null
                                                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
                                                    : '',
                                                isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 shadow-lg'
                                                    : ''
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-base md:text-lg font-medium flex-1 text-slate-900 dark:text-slate-100">
                                                    {option.option_text}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                                                    >
                                                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Feedback Message */}
                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                className="p-4 md:p-5 rounded-2xl border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <Check className="w-7 h-7 text-white" strokeWidth={3} />
                                    </motion.div>
                                    <div>
                                        <p className="font-bold text-lg text-blue-700 dark:text-blue-300">
                                            Answer Selected! ✓
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {isLastQuestion ? 'Click below to submit your quiz.' : 'Click below to continue to the next question.'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center pt-4"
                    >
                        <motion.div
                            whileHover={{ scale: selectedAnswer !== null ? 1.05 : 1 }}
                            whileTap={{ scale: selectedAnswer !== null ? 0.95 : 1 }}
                        >
                            <Button
                                size="lg"
                                disabled={selectedAnswer === null || isSubmitting}
                                onClick={handleNextQuestion}
                                className={cn(
                                    'min-w-[200px] h-12 text-base font-semibold',
                                    'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
                                    'text-white shadow-lg hover:shadow-xl transition-all duration-300',
                                    'disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 disabled:cursor-not-allowed'
                                )}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : isLastQuestion ? (
                                        <>
                                            Submit Quiz
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    ) : (
                                        <>
                                            Next Question
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FloodQuiz;
