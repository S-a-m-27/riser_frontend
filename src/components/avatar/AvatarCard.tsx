import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AvatarCardProps {
    id: string;
    imageUrl: string;
    name: string;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}

const AvatarCard: React.FC<AvatarCardProps> = ({
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
                scale: 1.08,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className="relative"
        >
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300",
                    "focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2",
                    "shadow-md hover:shadow-xl",
                    isSelected
                        ? "border-blue-600 dark:border-blue-400 shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg"
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

                    {/* Gradient Overlay on Hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
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
                            className="absolute inset-0 bg-blue-600/15 dark:bg-blue-400/15"
                        />
                    )}
                </AnimatePresence>

                {/* Glow Effect on Selection */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                scale: [0.8, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl -z-10"
                        />
                    )}
                </AnimatePresence>

                {/* Checkmark Badge */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: 0,
                                opacity: 1,
                            }}
                            exit={{ scale: 0, rotate: 180, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg z-10"
                        >
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bounce Effect on Selection */}
                {isSelected && (
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeOut",
                        }}
                        className="absolute inset-0 pointer-events-none"
                    />
                )}
            </button>
        </motion.div>
    );
};

export default AvatarCard;

