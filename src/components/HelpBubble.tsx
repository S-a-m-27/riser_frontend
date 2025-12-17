import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { kidCopy } from '../utils/kidCopy';

/**
 * Help Bubble Component
 * Always-visible floating help button that opens a tips panel
 * Accessible and kid-friendly
 */
const HelpBubble: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const tips = [
        "Click on modules to start learning!",
        "Complete quizzes to earn badges!",
        "Take your time - there's no rush!",
        "Ask a parent if you need help!",
        "Check your progress on the dashboard!",
    ];

    return (
        <>
            {/* Floating Help Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl flex items-center justify-center z-40 focus:outline-none focus:ring-4 focus:ring-primary-500/50 touch-target"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open help"
            >
                <HelpCircle className="w-7 h-7" />
            </motion.button>

            {/* Help Panel Modal */}
            <AnimatePresence>
                {isOpen && (
                    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[9999]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                            aria-hidden="true"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
                            <DialogPanel
                                as={motion.div}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-md pointer-events-auto"
                            >
                                {/* Modal Content - Dark blue-gray background with blue border */}
                                <div className="relative bg-slate-800 dark:bg-slate-900 border-2 border-blue-500 rounded-2xl shadow-2xl p-6 md:p-8">
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 z-10"
                                        aria-label="Close help"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>

                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Help Icon */}
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-400">
                                                <HelpCircle className="w-6 h-6 text-white" />
                                            </div>
                                            {/* Title */}
                                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                                {kidCopy.helpTitle}
                                            </h2>
                                        </div>
                                        {/* Subtitle */}
                                        <p className="text-white/80 text-sm md:text-base ml-13">
                                            {kidCopy.helpDescription}
                                        </p>
                                    </div>

                                    {/* Tips List */}
                                    <ul className="space-y-3">
                                        {tips.map((tip, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-3 p-4 bg-slate-700/50 dark:bg-slate-700/30 rounded-xl border border-slate-600/50"
                                            >
                                                {/* Number Badge */}
                                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                {/* Tip Text */}
                                                <p className="text-sm md:text-base text-slate-200 dark:text-slate-300 flex-1 pt-0.5">
                                                    {tip}
                                                </p>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
};

export default HelpBubble;



