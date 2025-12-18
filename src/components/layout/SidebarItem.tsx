import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                'relative group overflow-hidden',
                'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
                isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 pl-5'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            )}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Active indicator - left colored bar */}
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-green-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
            )}

            {/* Icon */}
            <Icon
                className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                )}
            />

            {/* Label */}
            <span className="font-medium text-base flex-1 text-left">{label}</span>

            {/* Soft glow on hover when not active */}
            {!isActive && (
                <motion.div
                    className="absolute inset-0 rounded-xl bg-blue-400/0 group-hover:bg-blue-400/5"
                    transition={{ duration: 0.2 }}
                />
            )}
        </motion.button>
    );
};

export default SidebarItem;
