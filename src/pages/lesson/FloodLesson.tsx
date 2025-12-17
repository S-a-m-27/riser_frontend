import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets,
    ArrowRight,
    Clock,
    AlertTriangle,
    Home,
    Shield,
    CheckCircle,
    Lightbulb,
    ChevronRight,
    ChevronLeft,
    Loader2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LessonSlide {
    id: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    points: string[];
    tip?: string;
    fact?: string;
}

const lessonSlides: LessonSlide[] = [
    {
        id: 1,
        title: 'Recognizing Early Signs of Flooding',
        icon: AlertTriangle,
        points: [
            'Watch for heavy rainfall warnings from weather services',
            'Monitor water levels in nearby rivers and streams',
            'Pay attention to flash flood watches and warnings',
        ],
        tip: 'Early warning can give you valuable time to prepare and evacuate safely.',
        fact: 'Just 6 inches of moving water can knock you off your feet!',
    },
    {
        id: 2,
        title: 'Preparing Your Home',
        icon: Home,
        points: [
            'Move valuable items to higher floors or elevated surfaces',
            'Install check valves to prevent water backup',
            'Keep important documents in waterproof containers',
        ],
        tip: 'Preparing your home before a flood can significantly reduce damage and losses.',
        fact: 'Flood damage is not typically covered by standard homeowners insurance.',
    },
    {
        id: 3,
        title: 'Emergency Kit Essentials',
        icon: Shield,
        points: [
            'Water: 1 gallon per person per day for at least 3 days',
            'Non-perishable food and manual can opener',
            'First aid kit, medications, and personal hygiene items',
            'Flashlight, batteries, and battery-powered radio',
        ],
        tip: 'Keep your emergency kit in an easily accessible location and check it regularly.',
        fact: 'You should have enough supplies to last at least 72 hours.',
    },
    {
        id: 4,
        title: 'Evacuation Safety',
        icon: Droplets,
        points: [
            'Follow evacuation orders immediately - don\'t wait',
            'Never drive through flooded areas or standing water',
            'Move to higher ground and avoid low-lying areas',
            'Stay informed through emergency alerts and radio',
        ],
        tip: 'Turn around, don\'t drown! Most flood-related deaths occur in vehicles.',
        fact: 'Just 12 inches of water can float most vehicles.',
    },
    {
        id: 5,
        title: 'After the Flood',
        icon: CheckCircle,
        points: [
            'Wait for authorities to declare it safe before returning',
            'Avoid contact with floodwater - it may be contaminated',
            'Document damage with photos for insurance claims',
            'Check for structural damage before entering buildings',
        ],
        tip: 'Floodwaters can contain sewage, chemicals, and other hazards.',
        fact: 'Mold can begin growing within 24-48 hours after flooding.',
    },
];

// API Response Types
interface LessonResponse {
    version: string;
    module: string;
    lesson_id: string;
    title: string;
    duration: number;
    duration_unit: string;
    objective: string;
    content: any; // Can be array (good) or object (better)
    metadata?: any;
}

const FloodLesson: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const version = searchParams.get('version') || 'good'; // Default to 'good'
    
    // Lesson data state
    const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // UI state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(false); // Start as false, will be enabled after lesson loads
    const [revealedTips, setRevealedTips] = useState<Set<number>>(new Set());
    const [revealedFacts, setRevealedFacts] = useState<Set<number>>(new Set());

    // Transform lesson content to slides format
    const [lessonSlides, setLessonSlides] = useState<LessonSlide[]>([]);

    // Fetch lesson data from API
    useEffect(() => {
        const fetchLesson = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const lessonId = version === 'better' ? 'flood-5min-enhanced' : 'flood-5min-baseline';
                console.log('API: Fetching lesson', { module: 'flood', lessonId, version });
                
                const response = await fetch(
                    `${API_BASE_URL}/api/lessons/flood/${lessonId}?version=${version}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch lesson');
                }

                const data: LessonResponse = await response.json();

                console.log('API: Lesson fetched successfully', data);
                setLessonData(data);
                
                // Transform lesson content to slides format
                const slides = transformLessonToSlides(data);
                setLessonSlides(slides);
                
                // Set timer based on lesson duration and start it
                setTimeRemaining(data.duration * 60);
                setIsTimerActive(true); // Start timer after lesson loads
                
            } catch (err) {
                console.error('API: Lesson fetch error', err);
                setError((err as Error).message || 'Failed to load lesson');
                // Fallback to empty slides - will show error state
                setLessonSlides([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLesson();
    }, [version]);

    // Transform lesson content to slides format
    const transformLessonToSlides = (lesson: LessonResponse): LessonSlide[] => {
        const slides: LessonSlide[] = [];
        
        if (lesson.version === 'good') {
            // Good version: can be array (legacy) or object with slides
            if (Array.isArray(lesson.content)) {
                // Legacy format: split array into 3 slides
                const points = lesson.content;
                const pointsPerSlide = Math.ceil(points.length / 3);
                const slideTitles = [
                    "Move to Safety",
                    "Gather Essentials", 
                    "Stay Informed & Evacuate"
                ];
                const slideIcons = [AlertTriangle, Home, Shield];
                
                for (let i = 0; i < 3; i++) {
                    const startIdx = i * pointsPerSlide;
                    const endIdx = Math.min(startIdx + pointsPerSlide, points.length);
                    const slidePoints = points.slice(startIdx, endIdx);
                    
                    if (slidePoints.length > 0) {
                        slides.push({
                            id: i + 1,
                            title: slideTitles[i] || lesson.title,
                            icon: slideIcons[i] || AlertTriangle,
                            points: slidePoints,
                        });
                    }
                }
            } else if (lesson.content && typeof lesson.content === 'object' && lesson.content.slides) {
                // New format: structured slides
                const slideIcons = [AlertTriangle, Home, Shield, CheckCircle, Lightbulb];
                lesson.content.slides.forEach((slide: any, index: number) => {
                    slides.push({
                        id: slide.id || index + 1,
                        title: slide.title || lesson.title,
                        icon: slideIcons[index % slideIcons.length] || AlertTriangle,
                        points: slide.points || [],
                    });
                });
            }
        } else if (lesson.version === 'better') {
            // Better version: structured content
            const content = lesson.content;
            
            // Slide 1: Intro and Steps
            if (content.intro && content.steps) {
                slides.push({
                    id: 1,
                    title: 'Immediate Actions',
                    icon: AlertTriangle,
                    points: content.steps.map((step: any) => `${step.order}. ${step.action}: ${step.description}`),
                });
            }
            
            // Slide 2: Do Section
            if (content.do_section) {
                slides.push({
                    id: 2,
                    title: content.do_section.title,
                    icon: CheckCircle,
                    points: content.do_section.items,
                });
            }
            
            // Slide 3: Do Not Section
            if (content.do_not_section) {
                slides.push({
                    id: 3,
                    title: content.do_not_section.title,
                    icon: Shield,
                    points: content.do_not_section.items,
                });
            }
            
            // Slide 4: Safety Checklist
            if (content.safety_checklist) {
                slides.push({
                    id: 4,
                    title: 'Safety Checklist',
                    icon: Home,
                    points: content.safety_checklist,
                });
            }
            
            // Slide 5: Reflection (if exists)
            if (content.reflection_prompt) {
                slides.push({
                    id: 5,
                    title: 'Think About This',
                    icon: Lightbulb,
                    points: [content.reflection_prompt],
                });
            }
        }
        
        return slides.length > 0 ? slides : [{
            id: 1,
            title: lesson.title,
            icon: Droplets,
            points: ['Lesson content is loading...'],
        }];
    };

    // Countdown timer - only runs when timer is active and lesson is loaded
    useEffect(() => {
        // Don't start timer if still loading or timer is not active
        if (isLoading || !isTimerActive) {
            return;
        }

        // Stop if time is up
        if (timeRemaining <= 0) {
            setIsTimerActive(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsTimerActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, isTimerActive, isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress based on lesson duration from API or default 5 minutes
    const lessonDuration = lessonData?.duration || 5;
    const totalSeconds = lessonDuration * 60;
    const progressPercentage = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

    const handleNextSlide = () => {
        if (currentSlide < lessonSlides.length - 1) {
            setCurrentSlide((prev) => prev + 1);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
        }
    };

    const handleRevealTip = (slideId: number) => {
        setRevealedTips((prev) => new Set(prev).add(slideId));
    };

    const handleRevealFact = (slideId: number) => {
        setRevealedFacts((prev) => new Set(prev).add(slideId));
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    const [direction, setDirection] = useState(0);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        if (newDirection === 1) {
            handleNextSlide();
        } else {
            handlePrevSlide();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading lesson...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || lessonSlides.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load lesson'}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    const currentSlideData = lessonSlides[currentSlide];
    const Icon = currentSlideData.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl flex-1 flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 flex flex-col space-y-6"
                >
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg mb-2"
                        >
                            <Droplets className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100">
                            {lessonData?.title || 'Flood Preparedness Lesson'}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            {lessonData?.objective || 'Learn the basics before you begin your journey.'}
                        </p>
                        {lessonData && (
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                Duration: {lessonData.duration} {lessonData.duration_unit}
                            </p>
                        )}
                    </div>

                    {/* Timer Section */}
                    <Card variant="elevated" className="overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300">
                                        Time Remaining
                                    </span>
                                </div>
                                <span className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lesson Slide Carousel */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <div className="relative flex-1 overflow-hidden rounded-2xl min-h-[500px] md:min-h-[600px]">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: 'spring', stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 },
                                    }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Card variant="elevated" className="h-full w-full flex flex-col shadow-xl">
                                        <CardContent className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 overflow-y-auto">
                                            {/* Slide Icon */}
                                            <div className="flex justify-center mb-4 md:mb-6 flex-shrink-0">
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 200,
                                                        damping: 15,
                                                    }}
                                                    className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl"
                                                >
                                                    <Icon className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" />
                                                </motion.div>
                                            </div>

                                            {/* Slide Title */}
                                            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-slate-100 text-center mb-6 md:mb-8 flex-shrink-0 leading-tight">
                                                {currentSlideData.title}
                                            </h2>

                                            {/* Learning Points */}
                                            <div className="space-y-4 mb-6 flex-shrink-0">
                                                {currentSlideData.points.map((point, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            delay: index * 0.1 + 0.3,
                                                            duration: 0.5,
                                                        }}
                                                        className="flex items-start gap-3 md:gap-4"
                                                    >
                                                        <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                                                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <p className="text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                                                            {point}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Interactive Elements */}
                                            <div className="space-y-4">
                                                {/* Tip Reveal */}
                                                {currentSlideData.tip && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.8 }}
                                                    >
                                                        {!revealedTips.has(currentSlideData.id) ? (
                                                            <button
                                                                onClick={() => handleRevealTip(currentSlideData.id)}
                                                                className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                        <span className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-200">
                                                                            Tap to reveal tip
                                                                        </span>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-sm md:text-base text-green-900 dark:text-green-200">
                                                                        <span className="font-semibold">Tip: </span>
                                                                        {currentSlideData.tip}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Fact Reveal */}
                                                {currentSlideData.fact && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.9 }}
                                                    >
                                                        {!revealedFacts.has(currentSlideData.id) ? (
                                                            <button
                                                                onMouseEnter={() => handleRevealFact(currentSlideData.id)}
                                                                className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                                        <span className="text-sm md:text-base font-semibold text-purple-900 dark:text-purple-200">
                                                                            Hover to uncover fact
                                                                        </span>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-sm md:text-base text-purple-900 dark:text-purple-200">
                                                                        <span className="font-semibold">Did you know? </span>
                                                                        {currentSlideData.fact}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {currentSlide > 0 && (
                                <button
                                    onClick={() => paginate(-1)}
                                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-700 dark:text-slate-300" />
                                </button>
                            )}
                            {currentSlide < lessonSlides.length - 1 && (
                                <button
                                    onClick={() => paginate(1)}
                                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-700 dark:text-slate-300" />
                                </button>
                            )}
                        </div>

                        {/* Slide Indicators (Dots) */}
                        <div className="flex justify-center gap-2 mt-6">
                            {lessonSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentSlide ? 1 : -1);
                                        setCurrentSlide(index);
                                    }}
                                    className={cn(
                                        'w-2 h-2 rounded-full transition-all duration-300',
                                        index === currentSlide
                                            ? 'w-8 bg-blue-600 dark:bg-blue-400'
                                            : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                                    )}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                size="lg"
                                       onClick={() => {
                                           const lessonId = lessonData?.lesson_id || 'flood-5min-baseline';
                                           navigate(`${ROUTES.QUIZ.FLOOD}?lesson_id=${lessonId}`);
                                       }}
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </Button>
                        </motion.div>
                        <p className="text-xs md:text-sm text-center text-slate-500 dark:text-slate-400">
                            You can take this lesson anytime to refresh.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FloodLesson;
