import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KidTooltipProps {
    content: string;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Kid-friendly Tooltip component
 * - Simplified and friendly tone
 * - Larger text for readability
 * - Gentle animations
 * - Accessible with proper ARIA attributes
 */
const KidTooltip: React.FC<KidTooltipProps> = ({ content, children, side = 'top' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sideClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
        >
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: side === 'top' ? 5 : side === 'bottom' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            'absolute z-50 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-xl shadow-lg max-w-xs',
                            sideClasses[side]
                        )}
                        role="tooltip"
                    >
                        <p className="text-center">{content}</p>
                        {/* Arrow */}
                        <div
                            className={cn(
                                'absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45',
                                side === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
                                side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
                                side === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
                                side === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1'
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Help icon with tooltip - commonly used pattern
 */
export const HelpIcon: React.FC<{ content: string }> = ({ content }) => {
    return (
        <KidTooltip content={content}>
            <button
                type="button"
                aria-label="Help"
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
                <HelpCircle className="w-5 h-5" />
            </button>
        </KidTooltip>
    );
};

export default KidTooltip;



