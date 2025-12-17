import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowUp, ArrowDown, ArrowRight, Loader2, AlertTriangle, Trophy, RotateCcw } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Response Types
interface PuzzleItem {
    id: string;
    step_text: string;
}

interface PuzzleData {
    id: string;
    module: string;
    title: string;
    description: string | null;
    items: PuzzleItem[];
    created_at: string;
}

interface SubmissionResult {
    attempt_id: string;
    puzzle_id: string;
    score: number;
    total_steps: number;
    correct_steps: number;
    completed: boolean;
    completed_at: string;
}

const FloodPuzzle: React.FC = () => {
    const navigate = useNavigate();
    
    // API data state
    const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // User ordering state - track the order of item IDs
    const [orderedItemIds, setOrderedItemIds] = useState<string[]>([]);
    
    // Results state
    const [showResults, setShowResults] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

    // Fetch puzzle from API
    useEffect(() => {
        const fetchPuzzle = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.warn('No access token found, redirecting to login');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }

                console.log('API: Fetching puzzle for module: flood');
                const response = await fetch(`${API_BASE_URL}/api/puzzles/flood`, {
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
                    throw new Error(errorData.detail || 'Failed to fetch puzzle');
                }

                const data: PuzzleData = await response.json();
                console.log('API: Puzzle fetched successfully', data);
                
                setPuzzleData(data);
                
                // Initialize ordered item IDs with the order from API (which is randomized)
                const initialOrder = data.items.map(item => item.id);
                setOrderedItemIds(initialOrder);
                
            } catch (err) {
                console.error('API: Puzzle fetch error', err);
                setError((err as Error).message || 'Failed to load puzzle');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPuzzle();
    }, [navigate]);

    // Get items in current order
    const getOrderedItems = (): PuzzleItem[] => {
        if (!puzzleData) return [];
        return orderedItemIds
            .map(id => puzzleData.items.find(item => item.id === id))
            .filter((item): item is PuzzleItem => item !== undefined);
    };

    // Move item up in order
    const moveItemUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...orderedItemIds];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setOrderedItemIds(newOrder);
    };

    // Move item down in order
    const moveItemDown = (index: number) => {
        if (index === orderedItemIds.length - 1) return;
        const newOrder = [...orderedItemIds];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setOrderedItemIds(newOrder);
    };

    // Submit puzzle attempt
    const handleSubmit = async () => {
        if (!puzzleData || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            console.log('API: Submitting puzzle attempt', {
                puzzle_id: puzzleData.id,
                ordered_item_ids: orderedItemIds,
            });

            const response = await fetch(`${API_BASE_URL}/api/puzzles/${puzzleData.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ordered_item_ids: orderedItemIds,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit puzzle');
            }

            const result: SubmissionResult = await response.json();
            console.log('API: Puzzle submitted successfully', result);
            
            setSubmissionResult(result);
            setShowResults(true);
            
        } catch (err) {
            console.error('API: Puzzle submission error', err);
            setError((err as Error).message || 'Failed to submit puzzle');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setShowResults(false);
        setSubmissionResult(null);
        // Reset to initial order
        if (puzzleData) {
            const initialOrder = puzzleData.items.map(item => item.id);
            setOrderedItemIds(initialOrder);
        }
    };

    const handleContinue = () => {
        navigate(ROUTES.SIMULATION.INTRO);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-blue-600 dark:text-blue-400 text-lg">Loading puzzle...</p>
            </div>
        );
    }

    // Error state
    if (error && !puzzleData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-900 p-4">
                <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Puzzle</h2>
                <p className="text-red-700 dark:text-red-300 text-center mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                    Try Again
                </Button>
            </div>
        );
    }

    // No puzzle data
    if (!puzzleData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <p className="text-slate-600 dark:text-slate-400">No puzzle data available</p>
            </div>
        );
    }

    const orderedItems = getOrderedItems();
    const isPerfect = submissionResult ? submissionResult.score === 100 : false;

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
                duration: 0.3,
            },
        },
    };

    // Results view
    if (showResults && submissionResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mb-8"
                    >
                        <div className={cn(
                            "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
                            isPerfect ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"
                        )}>
                            {isPerfect ? (
                                <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                            ) : (
                                <Check className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                            {isPerfect ? '🎉 Amazing! Perfect Sequence! 🎉' : '✨ Great Job! ✨'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            {isPerfect 
                                ? 'You got everything right! You\'re a flood safety expert! 🌟' 
                                : `You got ${submissionResult.correct_steps} out of ${submissionResult.total_steps} steps correct. Keep practicing! 💪`
                            }
                        </p>
                    </motion.div>

                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <motion.div 
                                    className="text-center p-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="text-4xl mb-2">⭐</div>
                                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                        {Math.round(submissionResult.score)}%
                                    </div>
                                    <div className="text-base font-semibold text-slate-700 dark:text-slate-300">Your Score</div>
                                </motion.div>
                                <motion.div 
                                    className="text-center p-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-4xl mb-2">✅</div>
                                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                                        {submissionResult.correct_steps}/{submissionResult.total_steps}
                                    </div>
                                    <div className="text-base font-semibold text-slate-700 dark:text-slate-300">Correct Steps</div>
                                </motion.div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleRetry}
                                        variant="outline"
                                        className="flex items-center gap-2 text-base font-semibold px-6 py-3 border-2"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                        Try Again 🔄
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleContinue}
                                        className="flex items-center gap-2 text-base font-semibold px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                                    >
                                        Continue
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Main puzzle view
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-block mb-4">
                        <motion.div
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                            className="text-6xl"
                        >
                            🌊
                        </motion.div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-3">
                        {puzzleData.title}
                    </h1>
                    {puzzleData.description && (
                        <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl font-medium mb-2">
                            {puzzleData.description}
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-2xl">👆</span>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                            Use the arrows to move steps up or down!
                        </p>
                        <span className="text-2xl">👇</span>
                    </div>
                </motion.div>

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </motion.div>
                )}

                {/* Puzzle items */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3 mb-6"
                >
                    {orderedItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        {/* Step number - more colorful and fun */}
                                        <motion.div 
                                            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 flex items-center justify-center font-bold text-white text-lg shadow-lg"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {index + 1}
                                        </motion.div>
                                        
                                        {/* Step text - larger and more readable */}
                                        <div className="flex-1 text-slate-800 dark:text-slate-200 text-base md:text-lg font-medium leading-relaxed">
                                            {item.step_text}
                                        </div>
                                        
                                        {/* Reorder buttons - more colorful and fun */}
                                        <div className="flex flex-col gap-2">
                                            <motion.button
                                                onClick={() => moveItemUp(index)}
                                                disabled={index === 0}
                                                whileHover={{ scale: index === 0 ? 1 : 1.1 }}
                                                whileTap={{ scale: index === 0 ? 1 : 0.9 }}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all duration-200 shadow-md",
                                                    index === 0 
                                                        ? "bg-slate-200 dark:bg-slate-700 opacity-50 cursor-not-allowed" 
                                                        : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
                                                )}
                                                aria-label="Move up"
                                            >
                                                <ArrowUp className={cn(
                                                    "h-5 w-5",
                                                    index === 0 
                                                        ? "text-slate-500 dark:text-slate-400" 
                                                        : "text-white"
                                                )} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => moveItemDown(index)}
                                                disabled={index === orderedItems.length - 1}
                                                whileHover={{ scale: index === orderedItems.length - 1 ? 1 : 1.1 }}
                                                whileTap={{ scale: index === orderedItems.length - 1 ? 1 : 0.9 }}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all duration-200 shadow-md",
                                                    index === orderedItems.length - 1 
                                                        ? "bg-slate-200 dark:bg-slate-700 opacity-50 cursor-not-allowed" 
                                                        : "bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 cursor-pointer"
                                                )}
                                                aria-label="Move down"
                                            >
                                                <ArrowDown className={cn(
                                                    "h-5 w-5",
                                                    index === orderedItems.length - 1 
                                                        ? "text-slate-500 dark:text-slate-400" 
                                                        : "text-white"
                                                )} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Submit button */}
                <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            size="lg"
                            className="min-w-[250px] h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Checking your answer...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">✨</span>
                                    Check My Answer!
                                    <span className="ml-2">✨</span>
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FloodPuzzle;

