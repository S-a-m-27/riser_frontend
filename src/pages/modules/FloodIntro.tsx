import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Brain, Lock, Droplets, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../router/routeMap';

const FloodIntro: React.FC = () => {
    const navigate = useNavigate();

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
                    {/* Page Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
                        >
                            Flood Preparedness Module 💧
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                        >
                            Learn essential skills to stay safe during flooding. You've got this! 🌊
                        </motion.p>
                    </motion.div>

                    {/* Module Hero Illustration */}
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
                                y: [0, -15, 0],
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

                    {/* Learning Objective Cards */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                    >
                        {/* Live 5-Minute Lesson Card */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-blue-200 dark:border-blue-700 transition-all duration-300 overflow-hidden"
                        >
                            {/* Background gradient on hover */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
                            />

                            <div className="relative z-10 space-y-6">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                                    <PlayCircle className="w-10 h-10 text-white" />
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        Live 5-Minute Lesson 📚
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Watch a quick interactive lesson and learn the basics!
                                    </p>
                                </div>

                                {/* Button */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={() => navigate(ROUTES.MODULES.LESSON_FLOOD)}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Start Lesson
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full" />
                        </motion.div>

                        {/* Short Knowledge Quiz Card */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-purple-200 dark:border-purple-700 transition-all duration-300 overflow-hidden"
                        >
                            {/* Background gradient on hover */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                            />

                            <div className="relative z-10 space-y-6">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Brain className="w-10 h-10 text-white" />
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        Short Knowledge Quiz 🧠
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Test what you already know. Show off your skills!
                                    </p>
                                </div>

                                {/* Button */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={() => navigate(ROUTES.QUIZ.FLOOD)}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Take Quiz
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-transparent rounded-bl-full" />
                        </motion.div>
                    </motion.div>

                    {/* Progress Overview */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            Module Progress
                        </h2>

                        {/* Progress Bar */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Overall Progress
                                </span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    0%
                                </span>
                            </div>
                            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Locked Badges */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                Module Badges
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {[1, 2, 3].map((index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center opacity-60">
                                            <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Locked
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FloodIntro;



