import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, Building2, Check, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

interface StartingPoint {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const startingPoints: StartingPoint[] = [
    {
        id: 'home',
        name: 'Home',
        description: 'Start from your home and navigate through the flood scenario.',
        icon: Home,
    },
    {
        id: 'street',
        name: 'Street',
        description: 'Begin your journey on the street during the flood event.',
        icon: MapPin,
    },
    {
        id: 'upper-floor',
        name: 'Upper Floor',
        description: 'Start from an upper floor and make your way to safety.',
        icon: Building2,
    },
];

const StartPoint: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

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
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 md:space-y-12"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-3">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
                            Choose Your Starting Point
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            Select where you want to begin your flood survival journey.
                        </p>
                    </motion.div>

                    {/* Starting Point Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {startingPoints.map((point) => {
                            const Icon = point.icon;
                            const isSelected = selectedPoint === point.id;

                            return (
                                <motion.div
                                    key={point.id}
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedPoint(point.id)}
                                    className="cursor-pointer"
                                >
                                    <Card
                                        variant="outline"
                                        className={cn(
                                            'h-full transition-all duration-300 overflow-hidden relative',
                                            isSelected
                                                ? 'border-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-2xl'
                                                : 'border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
                                        )}
                                    >
                                        {/* Glow effect on hover */}
                                        {!isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl blur-xl -z-10"
                                            />
                                        )}

                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="absolute top-4 right-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                            >
                                                <Check className="w-6 h-6 text-white" />
                                            </motion.div>
                                        )}

                                        <CardContent className="p-6 md:p-8">
                                            {/* Illustration Placeholder */}
                                            <div className="relative mb-6">
                                                <div className="w-full h-48 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center overflow-hidden relative">
                                                    {/* Decorative pattern */}
                                                    <div className="absolute inset-0 opacity-20">
                                                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                                                    </div>

                                                    {/* Icon */}
                                                    <motion.div
                                                        animate={
                                                            isSelected
                                                                ? {
                                                                    scale: [1, 1.1, 1],
                                                                    rotate: [0, 5, -5, 0],
                                                                }
                                                                : {}
                                                        }
                                                        transition={{
                                                            duration: 2,
                                                            repeat: isSelected ? Infinity : 0,
                                                            ease: 'easeInOut',
                                                        }}
                                                    >
                                                        <Icon className="w-20 h-20 md:w-24 md:h-24 text-white relative z-10" />
                                                    </motion.div>

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
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-3">
                                                <h3
                                                    className={cn(
                                                        'text-2xl md:text-3xl font-bold',
                                                        isSelected
                                                            ? 'text-blue-600 dark:text-blue-400'
                                                            : 'text-slate-900 dark:text-slate-100'
                                                    )}
                                                >
                                                    {point.name}
                                                </h3>
                                                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {point.description}
                                                </p>
                                            </div>
                                        </CardContent>

                                        {/* Active border glow */}
                                        {isSelected && (
                                            <motion.div
                                                animate={{
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                                className="absolute inset-0 border-4 border-blue-400 rounded-xl pointer-events-none"
                                            />
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Continue Button */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-center pt-4"
                    >
                        <motion.div
                            whileHover={{ scale: selectedPoint ? 1.05 : 1 }}
                            whileTap={{ scale: selectedPoint ? 0.95 : 1 }}
                        >
                            <Button
                                size="lg"
                                disabled={!selectedPoint}
                                onClick={() => navigate(ROUTES.SIMULATION.LIVE)}
                                className={cn(
                                    'min-w-[240px] h-14 text-lg font-semibold',
                                    'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
                                    'text-white shadow-xl hover:shadow-2xl transition-all duration-300',
                                    'disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 disabled:cursor-not-allowed'
                                )}
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

export default StartPoint;


