import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    Shield,
    RotateCcw,
    ArrowLeft,
    CheckCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

interface DecisionReview {
    id: number;
    scene: string;
    choice: string;
    stress: number;
    morale: number;
    risk: number;
    image: string;
}

// Mock decision data
const mockDecisions: DecisionReview[] = [
    {
        id: 1,
        scene: 'You saw water rising quickly outside.',
        choice: 'Moved to the upper floor',
        stress: 5,
        morale: 2,
        risk: -10,
        image: '/assets/simulation/scene1.png',
    },
    {
        id: 2,
        scene: 'Power outage occurred in your area.',
        choice: 'Used flashlight and continued',
        stress: -3,
        morale: 2,
        risk: -5,
        image: '/assets/simulation/scene2.png',
    },
    {
        id: 3,
        scene: 'A neighbor called for assistance.',
        choice: 'Assessed the situation first before helping',
        stress: -2,
        morale: 3,
        risk: -8,
        image: '/assets/simulation/scene3.png',
    },
    {
        id: 4,
        scene: 'Emergency services tried to contact you.',
        choice: 'Answered the call and followed instructions',
        stress: -8,
        morale: 10,
        risk: -15,
        image: '/assets/simulation/scene4.png',
    },
    {
        id: 5,
        scene: 'Final evacuation decision point.',
        choice: 'Evacuated to the designated safe zone',
        stress: -10,
        morale: 10,
        risk: -20,
        image: '/assets/simulation/scene5.png',
    },
];

const ReviewDecisions: React.FC = () => {
    const navigate = useNavigate();

    const getImpactColor = (value: number) => {
        if (value > 0) return 'text-red-600 dark:text-red-400';
        if (value < 0) return 'text-green-600 dark:text-green-400';
        return 'text-yellow-600 dark:text-yellow-400';
    };

    const getImpactBgColor = (value: number) => {
        if (value > 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        if (value < 0) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    };

    const getImpactIndicator = (value: number) => {
        if (value > 0) return 'bg-red-500';
        if (value < 0) return 'bg-green-500';
        return 'bg-yellow-500';
    };

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
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-3">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
                            Your Simulation Decisions Review
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            See how each choice affected your outcome.
                        </p>
                    </motion.div>

                    {/* Timeline Section */}
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500 hidden md:block" />

                        <div className="space-y-8">
                            {mockDecisions.map((decision, index) => (
                                <motion.div
                                    key={decision.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    className="relative"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-6 md:left-10 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg hidden md:block z-10" />

                                    {/* Decision Card */}
                                    <Card variant="elevated" className="ml-0 md:ml-16">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                                    {decision.id}
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl md:text-2xl">
                                                        Decision {decision.id}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {decision.scene}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Scenario Image Placeholder */}
                                            <div className="w-full h-32 md:h-48 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center overflow-hidden relative">
                                                <div className="absolute inset-0 opacity-20">
                                                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                                                </div>
                                                <div className="text-white/80 text-2xl md:text-4xl font-bold relative z-10">
                                                    Scene {decision.id}
                                                </div>
                                            </div>

                                            {/* Decision Choice */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                                                            Your Choice:
                                                        </p>
                                                        <p className="text-base text-slate-900 dark:text-slate-100 font-medium">
                                                            {decision.choice}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Impact Breakdown */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                                    Impact Breakdown
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Stress Impact */}
                                                    <div
                                                        className={cn(
                                                            'p-4 rounded-xl border-2',
                                                            getImpactBgColor(decision.stress)
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <AlertTriangle
                                                                className={cn(
                                                                    'w-5 h-5',
                                                                    getImpactColor(decision.stress)
                                                                )}
                                                            />
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                Stress
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'text-2xl font-bold mb-2',
                                                                getImpactColor(decision.stress)
                                                            )}
                                                        >
                                                            {decision.stress > 0 ? '+' : ''}
                                                            {decision.stress}
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{
                                                                    width: `${Math.abs(decision.stress) * 5}%`,
                                                                }}
                                                                transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                                                                className={cn(
                                                                    'h-full rounded-full',
                                                                    getImpactIndicator(decision.stress)
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Morale Impact */}
                                                    <div
                                                        className={cn(
                                                            'p-4 rounded-xl border-2',
                                                            getImpactBgColor(decision.morale)
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            {decision.morale > 0 ? (
                                                                <ThumbsUp
                                                                    className={cn(
                                                                        'w-5 h-5',
                                                                        getImpactColor(decision.morale)
                                                                    )}
                                                                />
                                                            ) : (
                                                                <ThumbsDown
                                                                    className={cn(
                                                                        'w-5 h-5',
                                                                        getImpactColor(decision.morale)
                                                                    )}
                                                                />
                                                            )}
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                Morale
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'text-2xl font-bold mb-2',
                                                                getImpactColor(decision.morale)
                                                            )}
                                                        >
                                                            {decision.morale > 0 ? '+' : ''}
                                                            {decision.morale}
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{
                                                                    width: `${Math.abs(decision.morale) * 5}%`,
                                                                }}
                                                                transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
                                                                className={cn(
                                                                    'h-full rounded-full',
                                                                    getImpactIndicator(decision.morale)
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Risk Impact */}
                                                    <div
                                                        className={cn(
                                                            'p-4 rounded-xl border-2',
                                                            getImpactBgColor(decision.risk)
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Shield
                                                                className={cn(
                                                                    'w-5 h-5',
                                                                    getImpactColor(decision.risk)
                                                                )}
                                                            />
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                Risk
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'text-2xl font-bold mb-2',
                                                                getImpactColor(decision.risk)
                                                            )}
                                                        >
                                                            {decision.risk > 0 ? '+' : ''}
                                                            {decision.risk}
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{
                                                                    width: `${Math.abs(decision.risk) * 2}%`,
                                                                }}
                                                                transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                                                                className={cn(
                                                                    'h-full rounded-full',
                                                                    getImpactIndicator(decision.risk)
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Callout */}
                    <motion.div variants={itemVariants}>
                        <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                    Summary
                                </h3>
                                <p className="text-base text-slate-700 dark:text-slate-300 mb-6">
                                    Your decisions strongly affected your final outcome. Here's what contributed the most.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        'Prioritizing safety and following emergency instructions significantly reduced your risk level.',
                                        'Your quick response to power outages helped maintain team morale throughout the simulation.',
                                        'Assessing situations before acting showed strong risk recognition skills.',
                                    ].map((insight, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                                                {insight}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Navigation Buttons */}
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
                                onClick={() => navigate(ROUTES.SIMULATION.START_POINT)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5" />
                                    Retry Simulation
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
                                onClick={() => navigate(ROUTES.SIMULATION.RESULT)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Results
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
                                className="w-full sm:w-auto min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Continue
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

export default ReviewDecisions;

