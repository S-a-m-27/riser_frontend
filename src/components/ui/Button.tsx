import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { playClick } from '../../utils/sound';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg';
    playSound?: boolean; // Option to disable sound for specific buttons
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', playSound = true, onClick, children, ...props }, ref) => {
        const baseClasses = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

        const variantClasses = {
            default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0",
            secondary: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 active:translate-y-0",
            outline: "border-2 border-blue-500 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
            ghost: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:-translate-y-0.5 active:translate-y-0",
        };

        const sizeClasses = {
            default: "h-11 px-6 text-base",
            sm: "h-9 px-4 text-sm rounded-xl",
            lg: "h-14 px-8 text-lg rounded-2xl",
        };

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (playSound && !props.disabled) {
                playClick();
            }
            onClick?.(e);
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
                onClick={handleClick}
                {...(props as any)}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export default Button;

