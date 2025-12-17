import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
        {...props}
    />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    ...props
}) => (
    <h2
        className={cn('text-2xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100', className)}
        {...props}
    />
);

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn('p-6 pt-0 overflow-y-auto max-h-[calc(90vh-200px)]', className)}
        {...props}
    />
);

const DialogClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    className,
    onClick,
    ...props
}) => (
    <button
        onClick={onClick}
        className={cn(
            'absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity p-2',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            className
        )}
        {...props}
    >
        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
    </button>
);

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose };








