import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KidAvatarCardProps {
    id: string;
    imageUrl: string;
    name: string;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}

/**
 * Kid-friendly AvatarCard component
 * - Friendly frame with larger tappable area (minimum 44px)
 * - Accessible aria-label
 * - Bounce animation on selection
 * - Larger visual feedback
 */
const KidAvatarCard: React.FC<KidAvatarCardProps> = ({
    imageUrl,
    name,
    isSelected,
    onClick,
    index,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay: index * 0.08,
                duration: 0.4,
                type: "spring",
                stiffness: 100,
            }}
            whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className="relative"
        >
            <button
                type="button"
                onClick={onClick}
                aria-label={`Select avatar ${name}`}
                className={cn(
                    "relative w-full aspect-square rounded-2xl overflow-hidden border-3 transition-all duration-300 touch-target",
                    "focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:ring-offset-2",
                    "shadow-lg hover:shadow-xl",
                    isSelected
                        ? "border-primary-600 dark:border-primary-400 shadow-2xl shadow-primary-500/30 ring-4 ring-primary-500/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500"
                )}
            >
                {/* Avatar Image */}
                <div className="relative w-full h-full">
                    <img
                        src={imageUrl}
                        alt={`Avatar ${name}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Selection Overlay */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-primary-600/20 dark:bg-primary-400/20"
                        />
                    )}
                </AnimatePresence>

                {/* Checkmark Badge - Larger for kid-friendly UI */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{
                                scale: [0, 1.3, 1],
                                rotate: 0,
                                opacity: 1,
                            }}
                            exit={{ scale: 0, rotate: 180, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="absolute top-2 right-2 w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-full flex items-center justify-center shadow-xl z-10"
                        >
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bounce Effect on Selection */}
                {isSelected && (
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                            repeat: 1,
                        }}
                        className="absolute inset-0 pointer-events-none"
                    />
                )}
            </button>
        </motion.div>
    );
};

export default KidAvatarCard;

