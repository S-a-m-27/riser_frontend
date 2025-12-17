import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Clock,
    Trophy,
    ArrowRight,
    Flashlight,
    Battery,
    Heart,
    FileText,
    Droplets,
    Radio,
    MapPin,
    Phone,
    Home,
    Shield,
    Package,
    AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../../components/ui/Dialog';
import { checklistItems, ChecklistItem, IconName } from '../../services/mock/checklistItems';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

// Icon mapping
const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
    Flashlight,
    Battery,
    Heart,
    FileText,
    Droplets,
    Radio,
    MapPin,
    Phone,
    Home,
    Shield,
    Package,
    AlertCircle,
};

interface PlacedItem {
    itemId: number;
    zone: 'kit' | 'home';
    isCorrect: boolean;
}

const PuzzleTask: React.FC = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [draggedItem, setDraggedItem] = useState<ChecklistItem | null>(null);
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [availableItems, setAvailableItems] = useState<ChecklistItem[]>(checklistItems);
    const [showCompletion, setShowCompletion] = useState(false);
    const [startTime] = useState(Date.now());
    const kitZoneRef = useRef<HTMLDivElement>(null);
    const homeZoneRef = useRef<HTMLDivElement>(null);

    // Timer countdown
    useEffect(() => {
        if (!isTimerActive || timeLeft <= 0) {
            setIsTimerActive(false);
            if (timeLeft <= 0) {
                handleComplete();
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsTimerActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isTimerActive]);

    const handleDragStart = (e: React.DragEvent, item: ChecklistItem) => {
        if (!isTimerActive) return;
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, zone: 'kit' | 'home') => {
        e.preventDefault();
        if (!draggedItem || !isTimerActive) return;

        const isCorrect = draggedItem.correctZone === zone;

        // Add to placed items
        setPlacedItems((prev) => [
            ...prev,
            {
                itemId: draggedItem.id,
                zone,
                isCorrect,
            },
        ]);

        // Remove from available items
        setAvailableItems((prev) => prev.filter((item) => item.id !== draggedItem.id));

        // Check if all items are placed
        if (availableItems.length === 1) {
            setTimeout(() => handleComplete(), 500);
        }

        setDraggedItem(null);
    };

    const handleComplete = () => {
        setIsTimerActive(false);
        setShowCompletion(true);
    };

    const correctCount = placedItems.filter((item) => item.isCorrect).length;
    const timeBonus = Math.max(0, timeLeft * 10);
    const totalScore = correctCount * 100 + timeBonus;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    const percentage = (timeLeft / 60) * 100;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

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
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Background Map Placeholder */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzEwNzNhMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VVQgTWFwIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==')] bg-cover bg-center" />
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 md:space-y-8"
                >
                    {/* Page Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Emergency Flood Checklist 🎒
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            Drag and drop items to the right places! Build your emergency kit like a pro! 💪
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="flex justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-20 h-20"
                        >
                            <svg className="transform -rotate-90 w-20 h-20">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    className="text-slate-200 dark:text-slate-700"
                                />
                                <motion.circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    fill="none"
                                    stroke={timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#10b981'}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <Clock className="w-5 h-5 mx-auto text-slate-600 dark:text-slate-400 mb-1" />
                                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {timeLeft}s
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Drop Zones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                        {/* Emergency Kit Zone */}
                        <motion.div
                            ref={kitZoneRef}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'kit')}
                            className={cn(
                                'min-h-[300px] rounded-2xl border-4 border-dashed p-6 transition-all duration-300',
                                draggedItem
                                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                            )}
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
                                Emergency Kit
                            </h3>
                            <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                                {placedItems
                                    .filter((item) => item.zone === 'kit')
                                    .map((placedItem) => {
                                        const item = checklistItems.find((i) => i.id === placedItem.itemId);
                                        if (!item) return null;
                                        const Icon = iconMap[item.iconName];
                                        return (
                                            <motion.div
                                                key={placedItem.itemId}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{
                                                    scale: placedItem.isCorrect ? 1 : [1, 1.1, 1],
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 200,
                                                }}
                                                className={cn(
                                                    'p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2',
                                                    placedItem.isCorrect
                                                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-400 shadow-lg'
                                                        : 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-400 shadow-lg animate-pulse'
                                                )}
                                            >
                                                <Icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                                                    {item.label}
                                                </span>
                                                {placedItem.isCorrect && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                            </div>
                        </motion.div>

                        {/* Home Preparation Zone */}
                        <motion.div
                            ref={homeZoneRef}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'home')}
                            className={cn(
                                'min-h-[300px] rounded-2xl border-4 border-dashed p-6 transition-all duration-300',
                                draggedItem
                                    ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                                    : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                            )}
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
                                Home Preparation
                            </h3>
                            <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                                {placedItems
                                    .filter((item) => item.zone === 'home')
                                    .map((placedItem) => {
                                        const item = checklistItems.find((i) => i.id === placedItem.itemId);
                                        if (!item) return null;
                                        const Icon = iconMap[item.iconName];
                                        return (
                                            <motion.div
                                                key={placedItem.itemId}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{
                                                    scale: placedItem.isCorrect ? 1 : [1, 1.1, 1],
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 200,
                                                }}
                                                className={cn(
                                                    'p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2',
                                                    placedItem.isCorrect
                                                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-400 shadow-lg'
                                                        : 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-400 shadow-lg animate-pulse'
                                                )}
                                            >
                                                <Icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                                                    {item.label}
                                                </span>
                                                {placedItem.isCorrect && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Available Items Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Available Items
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {availableItems.map((item) => {
                                const Icon = iconMap[item.iconName];
                                return (
                                    <motion.div
                                        key={item.id}
                                        variants={itemVariants}
                                        draggable={isTimerActive}
                                        onDragStart={(e) => {
                                            // Use native drag event
                                            const nativeEvent = e as unknown as React.DragEvent;
                                            handleDragStart(nativeEvent, item);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            'p-4 rounded-2xl border-2 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 shadow-lg cursor-move transition-all duration-300',
                                            'hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105',
                                            !isTimerActive && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                                                {item.label}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Manual Complete Button (for testing) */}
                    {availableItems.length === 0 && !showCompletion && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center pt-4"
                        >
                            <Button
                                onClick={handleComplete}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                                Complete Task
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Completion Modal */}
            <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
                {/* Celebration confetti */}
                {showCompletion && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                        {[...Array(30)].map((_, i) => (
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
                                }}
                                className="absolute w-4 h-4 rounded-full"
                                style={{
                                    backgroundColor: ['#3B82F6', '#10B981', '#FACC15', '#FB923C'][Math.floor(Math.random() * 4)],
                                    left: `${Math.random() * 100}%`,
                                }}
                            />
                        ))}
                    </div>
                )}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <motion.div
                            animate={{
                                rotate: [0, 20, -20, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: 3,
                            }}
                        >
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            Checklist Complete! 🎉
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {correctCount}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Correct Items
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {timeBonus}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Time Bonus
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                Total Score: {totalScore}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Time taken: {timeTaken}s
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => navigate(ROUTES.SIMULATION.INTRO)}
                                    className="min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Continue
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PuzzleTask;

