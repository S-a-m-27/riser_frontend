import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, AlertTriangle, MessageCircle, Loader2, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '../../components/ui/Dialog';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../config/api';

// API Response Types
interface MisinformationItem {
    id: string;
    statement: string;
    order: number;
}

interface MisinformationCheck {
    id: string;
    module: string;
    title: string;
    description: string | null;
    items: MisinformationItem[];
    created_at: string;
}

interface UserResponse {
    item_id: string;
    user_response: 'likely_true' | 'likely_false' | 'not_sure';
}

interface SubmissionResult {
    attempt_id: string;
    check_id: string;
    awareness_score: number;
    total_items: number;
    correct_identifications: number;
    completed_at: string;
}

interface FeedbackResult {
    item: MisinformationItem;
    user_response: string;
    is_correct: boolean;
    explanation: string;
    is_misinformation: boolean;
}

interface AttemptDetailItem {
    item_id: string;
    statement: string;
    user_response: string;
    is_correct: boolean;
    is_misinformation: boolean;
    explanation: string;
}

interface AttemptDetail {
    id: string;
    check_id: string;
    check_title: string;
    awareness_score: number;
    total_items: number;
    correct_identifications: number;
    started_at: string;
    completed_at: string | null;
    items: AttemptDetailItem[];
}

const MisinformationTask: React.FC = () => {
    const navigate = useNavigate();
    
    // API data state
    const [checkData, setCheckData] = useState<MisinformationCheck | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // User responses state
    const [userResponses, setUserResponses] = useState<Map<string, 'likely_true' | 'likely_false' | 'not_sure'>>(new Map());
    
    // Results state
    const [showFeedback, setShowFeedback] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
    const [feedbackResults, setFeedbackResults] = useState<FeedbackResult[]>([]);

    // Fetch misinformation check from API
    useEffect(() => {
        const fetchMisinformationCheck = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.warn('No access token found, redirecting to login');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }

                console.log('API: Fetching misinformation check for flood');
                const response = await fetch(`${API_BASE_URL}/api/misinformation/flood`, {
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
                    throw new Error(errorData.detail || 'Failed to fetch misinformation check');
                }

                const data: MisinformationCheck = await response.json();
                console.log('API: Misinformation check fetched successfully', data);
                
                setCheckData(data);
                
                // Initialize user responses map
                const initialResponses = new Map<string, 'likely_true' | 'likely_false' | 'not_sure'>();
                data.items.forEach(item => {
                    initialResponses.set(item.id, 'not_sure');
                });
                setUserResponses(initialResponses);
                
            } catch (err) {
                console.error('API: Misinformation check fetch error', err);
                setError((err as Error).message || 'Failed to load misinformation check');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMisinformationCheck();
    }, [navigate]);

    const handleResponseSelect = (itemId: string, response: 'likely_true' | 'likely_false' | 'not_sure') => {
        setUserResponses((prev) => {
            const newMap = new Map(prev);
            newMap.set(itemId, response);
            return newMap;
        });
    };

    const handleSubmit = async () => {
        if (!checkData) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            // Prepare responses
            const responses: UserResponse[] = Array.from(userResponses.entries()).map(([item_id, user_response]) => ({
                item_id,
                user_response,
            }));

            console.log('API: Submitting misinformation check', { check_id: checkData.id, responses });
            
            const response = await fetch(`${API_BASE_URL}/api/misinformation/${checkData.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    responses: responses,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit misinformation check');
            }

            const result: SubmissionResult = await response.json();
            console.log('API: Misinformation check submitted successfully', result);
            
            setSubmissionResult(result);
            
            // Fetch detailed results with explanations
            const detailResponse = await fetch(`${API_BASE_URL}/api/misinformation/attempts/${result.attempt_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!detailResponse.ok) {
                throw new Error('Failed to fetch detailed results');
            }

            const attemptDetail: AttemptDetail = await detailResponse.json();
            console.log('API: Attempt detail fetched successfully', attemptDetail);
            
            // Map attempt detail items to feedback results
            const feedback: FeedbackResult[] = attemptDetail.items.map((detailItem) => {
                const item = checkData.items.find(i => i.id === detailItem.item_id);
                return {
                    item: item || { id: detailItem.item_id, statement: detailItem.statement, order: 0 },
                    user_response: detailItem.user_response,
                    is_correct: detailItem.is_correct,
                    explanation: detailItem.explanation,
                    is_misinformation: detailItem.is_misinformation,
                };
            });
            
            setFeedbackResults(feedback);
            setShowFeedback(true);
            
        } catch (err) {
            console.error('API: Misinformation check submission error', err);
            setError((err as Error).message || 'Failed to submit misinformation check');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        setShowFeedback(false);
        navigate(ROUTES.PUZZLE_FLOOD);
    };

    const allItemsAnswered = checkData ? checkData.items.every(item => {
        const response = userResponses.get(item.id);
        return response !== undefined && response !== null;
    }) : false;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                <p className="ml-4 text-green-600 dark:text-green-400 text-lg">Loading misinformation check...</p>
            </div>
        );
    }

    // Error state
    if (error && !checkData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-900 p-4">
                <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Check</h2>
                <p className="text-red-700 dark:text-red-300 text-center mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                    Try Again
                </Button>
            </div>
        );
    }

    // No check data
    if (!checkData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <p className="text-slate-600 dark:text-slate-400">No misinformation check data available</p>
            </div>
        );
    }

    // Sort items by order
    const sortedItems = [...checkData.items].sort((a, b) => a.order - b.order);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                {/* Error message for submission errors */}
                {error && checkData && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 rounded-xl"
                    >
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 md:space-y-8"
                >
                    {/* Page Header */}
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600 dark:text-green-400" />
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                {checkData.title}
                            </h1>
                        </div>
                        {checkData.description && (
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                                {checkData.description}
                            </p>
                        )}
                        <p className="text-base text-slate-500 dark:text-slate-400">
                            Read each statement and decide if it's likely true, likely false, or if you're not sure. 🕵️
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            Tip: Select "Not Sure" if you're uncertain - you'll still learn from the explanation!
                        </p>
                    </div>

                    {/* Friendly Mascot Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-4 border-2 border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                                    🦉
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <span className="font-bold">Fact Owl says:</span> "Think carefully about each statement. Trust your knowledge!"
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statements Container */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 max-h-[60vh] overflow-y-auto"
                    >
                        {sortedItems.map((item, index) => {
                            const userResponse = userResponses.get(item.id) || 'not_sure';

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="p-4 md:p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-4"
                                >
                                    {/* Statement */}
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 flex-1">
                                            {item.statement}
                                        </p>
                                    </div>

                                    {/* Response Options */}
                                    <div className="flex flex-wrap gap-3 pl-11">
                                        <button
                                            onClick={() => handleResponseSelect(item.id, 'likely_true')}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300',
                                                'hover:scale-105 active:scale-95',
                                                userResponse === 'likely_true'
                                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400 shadow-lg'
                                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500'
                                            )}
                                        >
                                            <ThumbsUp className={cn(
                                                'w-5 h-5',
                                                userResponse === 'likely_true'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            )} />
                                            <span className={cn(
                                                'text-sm font-medium',
                                                userResponse === 'likely_true'
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            )}>
                                                Likely True
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleResponseSelect(item.id, 'likely_false')}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300',
                                                'hover:scale-105 active:scale-95',
                                                userResponse === 'likely_false'
                                                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400 shadow-lg'
                                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500'
                                            )}
                                        >
                                            <ThumbsDown className={cn(
                                                'w-5 h-5',
                                                userResponse === 'likely_false'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            )} />
                                            <span className={cn(
                                                'text-sm font-medium',
                                                userResponse === 'likely_false'
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            )}>
                                                Likely False
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleResponseSelect(item.id, 'not_sure')}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300',
                                                'hover:scale-105 active:scale-95',
                                                userResponse === 'not_sure'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-400 shadow-lg'
                                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-yellow-400 dark:hover:border-yellow-500'
                                            )}
                                        >
                                            <HelpCircle className={cn(
                                                'w-5 h-5',
                                                userResponse === 'not_sure'
                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            )} />
                                            <span className={cn(
                                                'text-sm font-medium',
                                                userResponse === 'not_sure'
                                                    ? 'text-yellow-700 dark:text-yellow-300'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            )}>
                                                Not Sure
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Action Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center pt-4"
                    >
                        <motion.div
                            whileHover={{ scale: allItemsAnswered ? 1.05 : 1 }}
                            whileTap={{ scale: allItemsAnswered ? 0.95 : 1 }}
                        >
                            <Button
                                size="lg"
                                disabled={!allItemsAnswered || isSubmitting}
                                onClick={handleSubmit}
                                className={cn(
                                    'min-w-[200px] h-12 text-base font-semibold',
                                    'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
                                    'text-white shadow-lg hover:shadow-xl transition-all duration-300',
                                    'disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 disabled:cursor-not-allowed'
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Answers'
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Selection Hint */}
                    {!allItemsAnswered && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                            Please select a response for each statement before submitting
                        </motion.p>
                    )}
                </motion.div>
            </div>

            {/* Feedback Dialog */}
            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
                <DialogClose onClick={() => setShowFeedback(false)} />
                <DialogHeader>
                    <DialogTitle>Your Evaluation Results</DialogTitle>
                </DialogHeader>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                        {/* Score Summary */}
                        {submissionResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border-2 border-green-200 dark:border-green-800"
                            >
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        Awareness Score: {submissionResult.awareness_score.toFixed(1)}%
                                    </h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">
                                        You correctly identified {submissionResult.correct_identifications} out of {submissionResult.total_items} statements
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Individual Results */}
                        {feedbackResults.map((result, index) => {
                            const userResponse = userResponses.get(result.item.id);
                            const isCorrect = result.is_correct;
                            
                            return (
                                <motion.div
                                    key={result.item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        'p-4 rounded-xl border-2',
                                        isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                                isCorrect
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                            )}
                                        >
                                            {isCorrect ? (
                                                <Check className="w-6 h-6 text-white" />
                                            ) : (
                                                <X className="w-6 h-6 text-white" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-100">
                                                {result.item.statement}
                                            </p>
                                            <div className="space-y-1">
                                                <p
                                                    className={cn(
                                                        'text-sm font-semibold',
                                                        isCorrect
                                                            ? 'text-green-700 dark:text-green-300'
                                                            : userResponse === 'not_sure'
                                                                ? 'text-yellow-700 dark:text-yellow-300'
                                                                : 'text-red-700 dark:text-red-300'
                                                    )}
                                                >
                                                    Your response: {userResponse === 'likely_true' ? 'Likely True' : userResponse === 'likely_false' ? 'Likely False' : 'Not Sure'}
                                                    {userResponse === 'not_sure' && ' (Uncertain - check the explanation below)'}
                                                </p>
                                                {result.explanation && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {result.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Continue Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: feedbackResults.length * 0.1 + 0.2 }}
                            className="flex justify-center pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={handleContinue}
                                    className="min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MisinformationTask;
