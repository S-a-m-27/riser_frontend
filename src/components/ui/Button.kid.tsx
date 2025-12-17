import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface KidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
    size?: 'default' | 'lg';
    emoji?: string; // Optional emoji to display
    children: React.ReactNode;
}

/**
 * Kid-friendly Button component
 * - Larger padding and touch targets (minimum 44px)
 * - Rounded-2xl corners
 * - Optional emoji support
 * - Accessible with proper ARIA labels
 */
const KidButton = React.forwardRef<HTMLButtonElement, KidButtonProps>(
    ({ className, variant = 'primary', size = 'default', emoji, children, ...props }, ref) => {
        const baseClasses = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target";

        const variantClasses = {
            primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-primary-500/50",
            secondary: "bg-accent-600 text-white hover:bg-accent-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-accent-500/50",
            accent: "bg-kidAccent-500 text-black hover:bg-kidAccent-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-kidAccent-500/50",
            outline: "border-2 border-primary-600 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-md hover:shadow-lg focus-visible:ring-primary-500/50",
            ghost: "hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 focus-visible:ring-primary-500/50",
        };

        const sizeClasses = {
            default: "h-12 px-6 text-base",
            lg: "h-14 px-8 text-lg",
        };

        return (
            <motion.button
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...(props as any)}
            >
                {emoji && <span className="mr-2 text-xl" aria-hidden="true">{emoji}</span>}
                {children}
            </motion.button>
        );
    }
);
KidButton.displayName = "KidButton";

export default KidButton;

