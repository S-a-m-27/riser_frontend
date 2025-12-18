import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    FileText,
    Vote,
    Clock,
    AlertTriangle,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES } from '../../router/routeMap';

interface TutorialSection {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    details: string[];
}

const tutorialSections: TutorialSection[] = [
    {
        id: 'stress',
        title: 'Stress Bar',
        description: 'Monitor your stress level throughout the simulation.',
        icon: TrendingUp,
        details: [
            'Making poor decisions increases stress',
            'Time pressure adds to stress',
            'High stress affects decision-making ability',
            'Take breaks and think carefully to manage stress',
        ],
    },
    {
        id: 'morale',
        title: 'Morale Bar',
        description: 'Track team morale and its impact on your group.',
        icon: Users,
        details: [
            'Team decisions affect overall morale',
            'Positive outcomes boost morale',
            'Low morale makes challenges harder',
            'Work together to maintain high morale',
        ],
    },
    {
        id: 'decisions',
        title: 'Decision Cards',
        description: 'Make choices that affect your survival journey.',
        icon: FileText,
        details: [
            'Read each decision carefully',
            'Consider short and long-term consequences',
            'Your choices affect stress, morale, and safety',
            'There are multiple valid paths to success',
        ],
    },
    {
        id: 'voting',
        title: 'Team Voting',
        description: 'Collaborate with your team on important decisions.',
        icon: Vote,
        details: [
            'Major decisions require team consensus',
            'Each team member votes on options',
            'Majority vote determines the action',
            'Discuss options before voting',
        ],
    },
    {
        id: 'timer',
        title: 'Timer',
        description: 'You have 10 minutes to complete the simulation.',
        icon: Clock,
        details: [
            'The simulation runs for 10 minutes',
            'Time remaining is shown at the top',
            'Some decisions are time-sensitive',
            'Balance speed with careful consideration',
        ],
    },
    {
        id: 'events',
        title: 'Risk Events',
        description: 'Random events can change your situation.',
        icon: AlertTriangle,
        details: [
            'Unexpected events occur during the simulation',
            'These events test your adaptability',
            'Stay calm and assess the situation',
            'Your previous decisions may help or hinder you',
        ],
    },
];

const Tutorial: React.FC = () => {
    const navigate = useNavigate();

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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
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
                            How the Simulation Works
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            Learn about the key features and mechanics of the flood survival simulation.
                        </p>
                    </motion.div>

                    {/* Tutorial Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {tutorialSections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <motion.div key={section.id} variants={cardVariants}>
                                    <Card variant="elevated" className="h-full hover:shadow-xl transition-shadow duration-300">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    animate={{
                                                        y: [0, -5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                        delay: index * 0.2,
                                                    }}
                                                    className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                                                >
                                                    <Icon className="w-7 h-7 text-white" />
                                                </motion.div>
                                                <CardTitle className="text-xl md:text-2xl">
                                                    {section.title}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-base text-slate-600 dark:text-slate-400">
                                                {section.description}
                                            </p>
                                            <ul className="space-y-2">
                                                {section.details.map((detail, detailIndex) => (
                                                    <motion.li
                                                        key={detailIndex}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            delay: index * 0.1 + detailIndex * 0.05 + 0.3,
                                                        }}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                                                            {detail}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Call to Action */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-center pt-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                onClick={() => navigate(ROUTES.SIMULATION.START_POINT)}
                                className="min-w-[280px] h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Got It, Start Simulation
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

export default Tutorial;


