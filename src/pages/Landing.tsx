import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield,
    BookOpen,
    ClipboardCheck,
    PlayCircle,
    Award,
    LifeBuoy,
    CheckCircle,
    Sparkles,
    ArrowRight,
    Heart,
    Smile,
    Users,
    Brain,
    Zap,
    Cpu,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ROUTES } from '../router/routeMap';
import { cn } from '../lib/utils';

// Audio placeholder hooks (for future implementation)
// TODO: Implement audio feedback system
const useAudioFeedback = () => {
    const playClickSound = useCallback(() => {
        // Placeholder for button click sound
        // Future: new Audio('/sounds/click.mp3').play()
    }, []);

    const playSuccessSound = useCallback(() => {
        // Placeholder for success chime
        // Future: new Audio('/sounds/success.mp3').play()
    }, []);

    const playHoverSound = useCallback(() => {
        // Placeholder for hover sound
        // Future: new Audio('/sounds/hover.mp3').play()
    }, []);

    return { playClickSound, playSuccessSound, playHoverSound };
};

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { playClickSound, playSuccessSound } = useAudioFeedback();

    // Friendly character avatars (diverse, cartoon-style)
    const friendlyCharacters = ['🦸', '👧', '👦', '🧒', '👩', '👨'];

    // Animation variants
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

    const cardHoverVariants = {
        rest: { scale: 1, y: 0 },
        hover: { 
            scale: 1.03, 
            y: -4,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
    };

    const iconFloatVariants = {
        animate: {
            y: [0, -8, 0],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient with animated elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 opacity-10 dark:opacity-5" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

                <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="text-center max-w-4xl mx-auto space-y-8"
                    >
                        {/* AI-Powered Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex items-center justify-center gap-3 mb-6"
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <Brain className="w-7 h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                            </motion.div>
                            <span className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI-Powered Learning Platform
                            </span>
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Zap className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
                            </motion.div>
                        </motion.div>

                        {/* RISER Logo */}
                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                                scale: [1, 1.01, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-block mb-6 md:mb-8 relative"
                        >
                            {/* Floating AI particles around logo */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute"
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${-10 + (i % 2) * 20}%`,
                                    }}
                                    animate={{
                                        y: [0, -15, 0],
                                        opacity: [0.3, 0.7, 0.3],
                                        scale: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                        duration: 2 + i * 0.3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.2,
                                    }}
                                >
                                    <Cpu className="w-3 h-3 text-purple-500 opacity-60" />
                                </motion.div>
                            ))}
                            
                            <img 
                                src="/images/riser-logo.svg" 
                                alt="RISER Logo" 
                                className="h-20 md:h-28 lg:h-32 mx-auto drop-shadow-2xl relative z-10"
                                style={{ 
                                    filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15))',
                                    maxWidth: '100%',
                                    height: 'auto'
                                }}
                            />
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight"
                        >
                            Learn to Stay Safe{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                During Floods
                            </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
                        >
                            Fun lessons, exciting quizzes, and adventure simulations that help you learn how to stay safe and help others during floods! 🌊✨
                        </motion.p>

                        {/* AI Features Highlight */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 15, -15, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </motion.div>
                                <span className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">
                                    AI-Powered Feedback
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                                <span className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Personalized Learning
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-full border border-pink-200 dark:border-pink-800"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                >
                                    <Zap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                </motion.div>
                                <span className="text-xs md:text-sm font-medium text-pink-700 dark:text-pink-300">
                                    Smart Insights
                                </span>
                            </motion.div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => {
                                        playClickSound();
                                        navigate(ROUTES.AUTH.SIGNUP);
                                    }}
                                    className="min-w-[220px] text-lg h-14 rounded-2xl shadow-xl hover:shadow-2xl"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Start Your Adventure! 🚀
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
                                        playClickSound();
                                        navigate(ROUTES.AUTH.LOGIN);
                                    }}
                                    className="min-w-[220px] text-lg h-14 rounded-2xl"
                                >
                                    Welcome Back! 👋
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* What is RISER? Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            What is RISER? 🤔
                        </h2>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <motion.div
                            variants={cardHoverVariants}
                            initial="rest"
                            whileHover="hover"
                        >
                            <Card variant="colorful" className="p-8 md:p-12 rounded-3xl border-2 border-blue-200 dark:border-blue-700">
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-center mb-6">
                                        <motion.div
                                            variants={iconFloatVariants}
                                            animate="animate"
                                            className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl"
                                        >
                                            <LifeBuoy className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                        </motion.div>
                                    </div>
                                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 text-center leading-relaxed">
                                        RISER is your friendly guide to learning about flood safety! 🌊 We make learning fun with interactive lessons, 
                                        exciting quizzes, and adventure simulations. Perfect for ages 12–16, you'll build confidence and learn how to 
                                        make smart choices—all in a safe, supportive space where every mistake is just another step toward becoming a safety hero! 🦸
                                    </p>
                                    {/* Friendly character indicators */}
                                    <div className="flex justify-center gap-2 pt-4">
                                        {friendlyCharacters.slice(0, 4).map((char, idx) => (
                                            <motion.span
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 + idx * 0.1 }}
                                                className="text-3xl"
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-4 py-16 md:py-24 bg-white/50 dark:bg-slate-800/50">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="max-w-6xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            How It Works 🎯
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Four fun steps to becoming a flood safety hero!
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Step 1: Learn */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Card variant="elevated" className="h-full p-6 md:p-8 text-center rounded-3xl border-2 border-blue-100 dark:border-blue-800">
                                <CardContent className="space-y-4">
                                    <motion.div 
                                        className="flex justify-center"
                                        variants={iconFloatVariants}
                                        animate="animate"
                                    >
                                        <div className="w-18 h-18 md:w-22 md:h-22 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl p-3">
                                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        1. Learn 📚
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-base">
                                        Fun, short lessons with cool visuals that make flood safety easy to understand!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Step 2: Test */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Card variant="elevated" className="h-full p-6 md:p-8 text-center rounded-3xl border-2 border-green-100 dark:border-green-800">
                                <CardContent className="space-y-4">
                                    <motion.div 
                                        className="flex justify-center"
                                        variants={iconFloatVariants}
                                        animate="animate"
                                    >
                                        <div className="w-18 h-18 md:w-22 md:h-22 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl p-3">
                                            <ClipboardCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        2. Test ✏️
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-base">
                                        Fun quizzes and games to see how much you've learned about staying safe!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Step 3: Practice */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Card variant="elevated" className="h-full p-6 md:p-8 text-center rounded-3xl border-2 border-purple-100 dark:border-purple-800">
                                <CardContent className="space-y-4">
                                    <motion.div 
                                        className="flex justify-center"
                                        variants={iconFloatVariants}
                                        animate="animate"
                                    >
                                        <div className="w-18 h-18 md:w-22 md:h-22 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl p-3">
                                            <PlayCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        3. Practice 🎮
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-base">
                                        Adventure simulations where you make choices and learn what happens—all in a safe space!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Step 4: Improve */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Card variant="elevated" className="h-full p-6 md:p-8 text-center rounded-3xl border-2 border-yellow-100 dark:border-yellow-800">
                                <CardContent className="space-y-4">
                                    <motion.div 
                                        className="flex justify-center"
                                        variants={iconFloatVariants}
                                        animate="animate"
                                    >
                                        <div className="w-18 h-18 md:w-22 md:h-22 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl p-3">
                                            <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        4. Improve 🏆
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-base">
                                        Get awesome results, helpful feedback, and cool certificates as you become a safety hero!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Why It Matters Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="max-w-5xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Why It Matters 💙
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: 'Builds Confidence',
                                description: 'Learn in a safe, friendly space where every try helps you grow stronger!',
                                color: 'from-blue-400 via-blue-500 to-cyan-500',
                                emoji: '✨',
                            },
                            {
                                icon: Heart,
                                title: 'Teaches Smart Choices',
                                description: 'Practice making great decisions and see how they help you and others stay safe!',
                                color: 'from-green-400 via-green-500 to-emerald-500',
                                emoji: '💚',
                            },
                            {
                                icon: Shield,
                                title: 'Super Safe Learning',
                                description: 'Everything happens in a supportive space made just for you—no scary surprises!',
                                color: 'from-purple-400 via-purple-500 to-pink-500',
                                emoji: '🛡️',
                            },
                            {
                                icon: Smile,
                                title: 'Made for Ages 12–16',
                                description: 'All content is designed to be fun, engaging, and perfect for your age group!',
                                color: 'from-orange-400 via-orange-500 to-yellow-500',
                                emoji: '😊',
                            },
                        ].map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <motion.div 
                                    key={index} 
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Card variant="outline" className="h-full p-6 md:p-8 rounded-3xl border-2 hover:shadow-xl transition-shadow">
                                        <CardContent className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <motion.div 
                                                    className={cn(
                                                        'w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0',
                                                        benefit.color
                                                    )}
                                                    variants={iconFloatVariants}
                                                    animate="animate"
                                                >
                                                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                                        {benefit.title} {benefit.emoji}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                                                        {benefit.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </section>

            {/* Call to Action Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <Card variant="colorful" className="p-8 md:p-12">
                        <CardContent className="space-y-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="inline-block mb-4"
                            >
                                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-400 mx-auto" />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100">
                                Ready to become a safety hero? 🦸
                            </h2>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                                Join RISER today and start your amazing adventure toward flood safety!
                            </p>
                            <div className="pt-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            playSuccessSound();
                                            playClickSound();
                                            navigate(ROUTES.AUTH.SIGNUP);
                                        }}
                                        className="min-w-[260px] text-lg h-16 rounded-3xl shadow-2xl hover:shadow-3xl"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Start Your Journey! 🌟
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </Button>
                                </motion.div>
                            </div>
                            {/* Friendly encouragement */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-slate-500 dark:text-slate-400 pt-2 flex items-center justify-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Join thousands of young learners building resilience!
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600 dark:text-slate-400 text-center md:text-left">
                            © RISER • Building Resilience Through Learning
                        </p>
                        <div className="flex gap-6 text-sm">
                            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                Privacy
                            </button>
                            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                Terms
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Add custom animation for blob effect */}
            <style>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Landing;

