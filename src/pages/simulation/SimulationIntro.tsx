import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, HelpCircle, Info, Droplets, ArrowRight, Loader2, Home, MapPin, Building2, Check, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { useToastContext } from '../../contexts/ToastContext';

import { API_BASE_URL } from '../../config/api';

const SimulationIntro: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToastContext();
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSceneType, setSelectedSceneType] = useState<'home' | 'street' | 'upper_floor' | null>(null);
    const [isMultiplayer, setIsMultiplayer] = useState(false);

    const handleStartSimulation = async (sceneType: 'home' | 'street' | 'upper_floor') => {
        if (!sceneType) return;
        setIsStarting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/simulation/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenario_type: sceneType,
                    is_multiplayer: isMultiplayer,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to start simulation');
            }

            const result = await response.json();
            const sessionId = result.session_id;

            // Store session ID
            localStorage.setItem('simulation_session_id', sessionId);

            // If multiplayer, inform user about invitations
            if (isMultiplayer) {
                toast.success('Multiplayer session created! You can invite friends from the simulation screen.', 5000);
            }

            // Navigate to simulation live with session_id
            navigate(`${ROUTES.SIMULATION.LIVE}?session_id=${sessionId}`);

        } catch (err) {
            console.error('Error starting simulation:', err);
            setError((err as Error).message || 'Failed to start simulation');
        } finally {
            setIsStarting(false);
        }
    };


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
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

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: 'easeOut',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
                            Flood Scenario Simulation
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            A 10-minute interactive flood survival experience.
                        </p>
                    </motion.div>

                    {/* Illustrated Hero Section */}
                    <motion.div
                        variants={itemVariants}
                        className="relative flex justify-center items-center py-8 md:py-12"
                    >
                        {/* Glow effect */}
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-blue-400/30 rounded-full blur-3xl"
                        />

                        {/* Floating illustration container */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative z-10"
                        >
                            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                                {/* Main illustration placeholder - using Droplets icon as placeholder */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                                    {/* Water wave pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                                            <path
                                                d="M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z"
                                                fill="white"
                                                opacity="0.3"
                                            />
                                            <path
                                                d="M0,250 Q100,200 200,250 T400,250 L400,400 L0,400 Z"
                                                fill="white"
                                                opacity="0.2"
                                            />
                                            <path
                                                d="M0,300 Q100,250 200,300 T400,300 L400,400 L0,400 Z"
                                                fill="white"
                                                opacity="0.15"
                                            />
                                        </svg>
                                    </div>

                                    {/* Icon */}
                                    <Droplets className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 text-white relative z-10" />

                                    {/* Shine effect */}
                                    <motion.div
                                        animate={{
                                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] rounded-3xl"
                                    />
                                </div>

                                {/* Decorative elements */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    className="absolute -top-4 -right-4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl"
                                />
                                <motion.div
                                    animate={{
                                        rotate: [360, 0],
                                    }}
                                    transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    className="absolute -bottom-4 -left-4 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl"
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Briefing Card */}
                    <motion.div variants={cardVariants}>
                        <Card variant="elevated" className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <Droplets className="w-6 h-6 text-white" />
                                    </div>
                                    Your Mission
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                    You will navigate a real-life flood scenario. Your decisions affect safety, stress level, and final resilience score.
                                </p>

                                {/* Bullet Points */}
                                <div className="space-y-3">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <p className="text-base text-slate-700 dark:text-slate-300 font-medium">
                                            Choose wisely
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <p className="text-base text-slate-700 dark:text-slate-300 font-medium">
                                            Stay calm
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <p className="text-base text-slate-700 dark:text-slate-300 font-medium">
                                            Think strategically
                                        </p>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Note Box */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-5"
                    >
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm md:text-base text-blue-800 dark:text-blue-200">
                                This simulation may take up to 10 minutes.
                            </p>
                        </div>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4"
                        >
                            <p className="text-sm md:text-base text-red-800 dark:text-red-200">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* Multiplayer Mode Toggle */}
                    <motion.div variants={itemVariants}>
                        <Card variant="elevated" className="overflow-hidden border-2 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                Multiplayer Mode
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Play with friends! Enable multiplayer to create a session and invite others to join.
                                            </p>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={isMultiplayer}
                                            onChange={(e) => setIsMultiplayer(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={cn(
                                            "relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out",
                                            isMultiplayer
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                                : "bg-slate-300 dark:bg-slate-600"
                                        )}>
                                            <motion.div
                                                className={cn(
                                                    "absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg",
                                                    isMultiplayer && "translate-x-6"
                                                )}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30
                                                }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold transition-colors",
                                            isMultiplayer
                                                ? "text-purple-600 dark:text-purple-400"
                                                : "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {isMultiplayer ? "ON" : "OFF"}
                                        </span>
                                    </label>
                                </div>
                                {isMultiplayer && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800"
                                    >
                                        <div className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300">
                                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>
                                                When you start the simulation, you can invite friends directly from the simulation screen. They'll receive invitations on their dashboard to join your session.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Scene Type Selection */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">
                            Choose Your Starting Location
                        </h2>
                        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                            Select where you want to begin your flood survival journey
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {/* Home Option */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSceneType('home')}
                                className={cn(
                                    "cursor-pointer p-6 rounded-xl border-2 transition-all duration-300",
                                    selectedSceneType === 'home'
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                                )}
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center",
                                        selectedSceneType === 'home'
                                            ? "bg-blue-500"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    )}>
                                        <Home className={cn(
                                            "w-8 h-8",
                                            selectedSceneType === 'home' ? "text-white" : "text-slate-600 dark:text-slate-400"
                                        )} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Home</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Start from your home and navigate through the flood scenario
                                    </p>
                                    {selectedSceneType === 'home' && (
                                        <Check className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                            </motion.div>

                            {/* Street Option */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSceneType('street')}
                                className={cn(
                                    "cursor-pointer p-6 rounded-xl border-2 transition-all duration-300",
                                    selectedSceneType === 'street'
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                                )}
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center",
                                        selectedSceneType === 'street'
                                            ? "bg-blue-500"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    )}>
                                        <MapPin className={cn(
                                            "w-8 h-8",
                                            selectedSceneType === 'street' ? "text-white" : "text-slate-600 dark:text-slate-400"
                                        )} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Street</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Begin your journey on the street during the flood event
                                    </p>
                                    {selectedSceneType === 'street' && (
                                        <Check className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                            </motion.div>

                            {/* Upper Floor Option */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSceneType('upper_floor')}
                                className={cn(
                                    "cursor-pointer p-6 rounded-xl border-2 transition-all duration-300",
                                    selectedSceneType === 'upper_floor'
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                                )}
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center",
                                        selectedSceneType === 'upper_floor'
                                            ? "bg-blue-500"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    )}>
                                        <Building2 className={cn(
                                            "w-8 h-8",
                                            selectedSceneType === 'upper_floor' ? "text-white" : "text-slate-600 dark:text-slate-400"
                                        )} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Upper Floor</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Start from an upper floor and make your way to safety
                                    </p>
                                    {selectedSceneType === 'upper_floor' && (
                                        <Check className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                    >
                        <motion.div
                            whileHover={!isStarting && selectedSceneType ? { scale: 1.05, y: -2 } : {}}
                            whileTap={!isStarting && selectedSceneType ? { scale: 0.95 } : {}}
                        >
                            <Button
                                size="lg"
                                onClick={() => selectedSceneType && handleStartSimulation(selectedSceneType)}
                                disabled={isStarting || !selectedSceneType}
                                className="w-full sm:w-auto min-w-[240px] h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isStarting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-6 h-6" />
                                            Start Simulation
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
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
                                onClick={() => navigate(ROUTES.SIMULATION.TUTORIAL)}
                                className="w-full sm:w-auto min-w-[200px] h-14 text-base font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <HelpCircle className="w-5 h-5" />
                                    How it Works
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default SimulationIntro;

