import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number; // in milliseconds, default 3000
}

interface ToastProps {
    toast: Toast;
    onClose: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-4 right-4 z-50 pointer-events-auto"
        >
            <Card
                variant="elevated"
                className={cn(
                    'min-w-[300px] max-w-[90vw] shadow-2xl',
                    getStyles()
                )}
            >
                <CardContent className="p-4 flex items-center gap-3">
                    {getIcon()}
                    <span className="flex-1 text-sm font-medium">
                        {toast.message}
                    </span>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        aria-label="Close toast"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast, index) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0, y: index * 80 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-4 z-50 pointer-events-auto"
                        style={{ 
                            top: `${16 + index * 80}px`
                        }}
                    >
                        <Card
                            variant="elevated"
                            className={cn(
                                'min-w-[300px] max-w-[90vw] shadow-2xl',
                                toast.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                    : toast.type === 'warning'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                    : toast.type === 'error'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                            )}
                        >
                            <CardContent className="p-4 flex items-center gap-3">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : toast.type === 'warning' ? (
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                ) : toast.type === 'error' ? (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                ) : (
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                                <span
                                    className={cn(
                                        'flex-1 text-sm font-medium',
                                        toast.type === 'success'
                                            ? 'text-green-800 dark:text-green-200'
                                            : toast.type === 'warning'
                                            ? 'text-yellow-800 dark:text-yellow-200'
                                            : toast.type === 'error'
                                            ? 'text-red-800 dark:text-red-200'
                                            : 'text-blue-800 dark:text-blue-200'
                                    )}
                                >
                                    {toast.message}
                                </span>
                                <button
                                    onClick={() => onClose(toast.id)}
                                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
                                    aria-label="Close toast"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastComponent;

