import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import AvatarCard from '../../components/avatar/AvatarCard';
import { useAvatarStore } from '../../store/avatarStore';
import { useConfetti } from '../../hooks/useConfetti';
import { useSound } from '../../hooks/useSound';
import { ROUTES } from '../../router/routeMap';
import { API_BASE_URL } from '../../config/api';

// Using DiceBear API for diverse, fun, cartoonish avatars
// This service provides illustrated avatars with different styles, genders, and skin tones
const generateAvatarUrl = (index: number) => {
    const styles = [
        'adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei',
        'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'shapes'
    ];
    const seeds = [
        'alex', 'blake', 'casey', 'dana', 'eli', 'finley',
        'gray', 'harper', 'ivy', 'jordan', 'kai', 'logan'
    ];

    // Using DiceBear API for diverse illustrated avatars
    return `https://api.dicebear.com/7.x/${styles[index]}/svg?seed=${seeds[index]}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=20`;
};

const avatars = Array.from({ length: 12 }, (_, i) => ({
    id: `avatar-${i + 1}`,
    url: generateAvatarUrl(i),
    name: ['Alex', 'Blake', 'Casey', 'Dana', 'Eli', 'Finley', 'Gray', 'Harper', 'Ivy', 'Jordan', 'Kai', 'Logan'][i],
}));

const SelectAvatar: React.FC = () => {
    const navigate = useNavigate();
    const { selectedAvatar, setAvatar } = useAvatarStore();
    const { triggerBurst } = useConfetti(true); // Get from settings in real app
    const { playSuccess } = useSound(true); // Get from settings in real app
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAvatarClick = (avatarId: string) => {
        setAvatar(avatarId);
        playSuccess(); // Play sound on selection
        setError(null); // Clear any previous errors
    };

    const handleContinue = async () => {
        if (!selectedAvatar) {
            setError('Please select an avatar');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                // If no token, just save locally and continue
                console.log('No token found, saving avatar locally only');
                triggerBurst();
                playSuccess();
                navigate(ROUTES.DASHBOARD);
                return;
            }

            console.log('API: Saving avatar to backend', { avatar: selectedAvatar });
            const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    avatar: selectedAvatar,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, save locally and continue
                    console.warn('Token expired, saving avatar locally only');
                    triggerBurst();
                    playSuccess();
                    navigate(ROUTES.DASHBOARD);
                    return;
                }
                throw new Error(data.detail || 'Failed to save avatar');
            }

            console.log('API: Avatar saved successfully', data);
            triggerBurst(); // Confetti on confirmation
            playSuccess();
            
            // Navigate to dashboard
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            console.error('API: Avatar save error', err);
            setError((err as Error).message || 'Failed to save avatar. You can continue anyway.');
            // Still allow navigation even if save fails
            triggerBurst();
            playSuccess();
            navigate(ROUTES.DASHBOARD);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-2xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200/30 dark:bg-pink-800/20 rounded-full blur-2xl"
                />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 border border-purple-100 dark:border-slate-700">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center space-y-3"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4"
                        >
                            <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Choose Your Avatar
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                            Pick an avatar that represents you! This will be your identity in the RISER world.
                        </p>
                    </motion.div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        {avatars.map((avatar, index) => (
                            <AvatarCard
                                key={avatar.id}
                                id={avatar.id}
                                imageUrl={avatar.url}
                                name={avatar.name}
                                isSelected={selectedAvatar === avatar.id}
                                onClick={() => handleAvatarClick(avatar.id)}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center"
                        >
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Continue Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex justify-center pt-4"
                    >
                        <Button
                            onClick={handleContinue}
                            disabled={!selectedAvatar || isSaving}
                            className="w-full md:w-auto min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 disabled:text-slate-500 shadow-lg hover:shadow-xl transition-all duration-300"
                            size="lg"
                        >
                            {isSaving ? 'Saving...' : selectedAvatar ? 'Continue →' : 'Select an Avatar'}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SelectAvatar;
