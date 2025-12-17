import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, MessageSquare, Settings } from 'lucide-react';
import { KidCard, KidCardContent, KidCardHeader, KidCardTitle } from '../../components/ui/Card.kid';
import KidButton from '../../components/ui/Button.kid';
import { kidCopy } from '../../utils/kidCopy';
import { useToastContext } from '../../contexts/ToastContext';

/**
 * Parental Controls Settings Page
 * 
 * MOCKED BEHAVIOR:
 * - All toggles are UI-only (no backend persistence)
 * - Settings are stored in localStorage for demo purposes
 * - In real app, these would be linked to parent account
 * 
 * BACKEND NEEDED:
 * - Store parental control settings per child account
 * - Link settings to parent account for management
 * - Enforce restrictions server-side
 * - Send notifications to parent when limits are reached
 */
const ParentalControls: React.FC = () => {
    const toast = useToastContext();
    const [multiplayerChat, setMultiplayerChat] = useState(true);
    const [restrictDifficulty, setRestrictDifficulty] = useState(false);
    const [dailyTimeLimit, setDailyTimeLimit] = useState(60); // minutes
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [confettiEnabled, setConfettiEnabled] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);

    const handleSave = () => {
        // MOCKED: In real app, save to backend
        localStorage.setItem('parentalControls', JSON.stringify({
            multiplayerChat,
            restrictDifficulty,
            dailyTimeLimit,
            soundsEnabled,
            confettiEnabled,
            reduceMotion,
        }));

        toast.success('Settings saved! (This is mocked - no backend yet)');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
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
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-lg"
                        >
                            <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            {kidCopy.parentalControls} 🛡️
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Manage safety settings and preferences
                        </p>
                    </div>

                    {/* Safety Settings */}
                    <KidCard variant="elevated">
                        <KidCardHeader>
                            <KidCardTitle className="flex items-center gap-3">
                                <Lock className="w-6 h-6 text-primary-600" />
                                Safety Settings
                            </KidCardTitle>
                        </KidCardHeader>
                        <KidCardContent className="space-y-6">
                            {/* Multiplayer Chat Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            Multiplayer Chat
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Allow chatting with other players
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={multiplayerChat}
                                        onChange={(e) => setMultiplayerChat(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            {/* Restrict Difficulty Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            Restrict Module Difficulty
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Only show age-appropriate content
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={restrictDifficulty}
                                        onChange={(e) => setRestrictDifficulty(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            {/* Daily Time Limit */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            Daily Play Time Limit
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Maximum minutes per day
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={dailyTimeLimit}
                                        onChange={(e) => setDailyTimeLimit(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                    <span className="text-2xl font-bold text-primary-600 w-20 text-right">
                                        {dailyTimeLimit} min
                                    </span>
                                </div>
                            </div>
                        </KidCardContent>
                    </KidCard>

                    {/* Preferences */}
                    <KidCard variant="elevated">
                        <KidCardHeader>
                            <KidCardTitle className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-accent-600" />
                                Preferences
                            </KidCardTitle>
                        </KidCardHeader>
                        <KidCardContent className="space-y-6">
                            {/* Sounds Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {kidCopy.enableSounds}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Play sounds for feedback
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={soundsEnabled}
                                        onChange={(e) => setSoundsEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            {/* Confetti Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {kidCopy.enableConfetti}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Show celebration animations
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confettiEnabled}
                                        onChange={(e) => setConfettiEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            {/* Reduce Motion Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {kidCopy.reduceMotion}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Reduce animations for accessibility
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reduceMotion}
                                        onChange={(e) => setReduceMotion(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </KidCardContent>
                    </KidCard>

                    {/* Save Button */}
                    <div className="flex justify-center pt-4">
                        <KidButton
                            onClick={handleSave}
                            variant="primary"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            Save Settings
                        </KidButton>
                    </div>

                    {/* Mock Notice */}
                    <div className="bg-accent-50 dark:bg-accent-900/20 border-2 border-accent-200 dark:border-accent-700 rounded-xl p-4">
                        <p className="text-sm text-accent-800 dark:text-accent-200">
                            <strong>Note:</strong> These settings are currently mocked. In the real app, they would be saved to your account and enforced by the backend.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ParentalControls;



