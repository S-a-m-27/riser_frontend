import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface KidCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'colorful';
}

/**
 * Kid-friendly Card component
 * - More rounded corners (rounded-2xl)
 * - Subtle paper shadow
 * - Larger padding for better spacing
 * - Gentle hover animations
 */
const KidCard = React.forwardRef<HTMLDivElement, KidCardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    'rounded-2xl transition-all duration-300 p-kid-lg',
                    {
                        'bg-white dark:bg-slate-800 shadow-soft border border-slate-200 dark:border-slate-700': variant === 'default',
                        'bg-white dark:bg-slate-800 shadow-xl border-2 border-primary-200 dark:border-primary-700': variant === 'elevated',
                        'bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-2 border-primary-200 dark:border-primary-700 shadow-lg': variant === 'colorful',
                    },
                    className
                )}
                whileHover={{ y: -2, scale: 1.01 }}
                {...(props as any)}
            />
        );
    }
);
KidCard.displayName = 'KidCard';

const KidCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-2 p-kid-lg pb-0', className)}
            {...props}
        />
    )
);
KidCardHeader.displayName = 'KidCardHeader';

const KidCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100', className)}
            {...props}
        />
    )
);
KidCardTitle.displayName = 'KidCardTitle';

const KidCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-kid-lg pt-0', className)} {...props} />
    )
);
KidCardContent.displayName = 'KidCardContent';

export { KidCard, KidCardHeader, KidCardTitle, KidCardContent };

