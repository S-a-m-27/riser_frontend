import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KidButton from './ui/Button.kid';
import KidInput from './ui/Input.kid';
import { kidCopy } from '../utils/kidCopy';
import { useUserStore } from '../store/userStore';

export interface ParentalConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConsentGiven: () => void;
}

/**
 * Parental Consent Modal
 * 
 * MOCKED BEHAVIOR:
 * - Shows steps for parental consent (no backend verification)
 * - "I'm a Parent" button shows parent info form
 * - "Send Consent Request" button mocks sending email/SMS
 * - Once "consent given" (mocked), allows user to proceed
 * 
 * BACKEND NEEDED:
 * - Send verification email/SMS to parent
 * - Verify parent's identity
 * - Store consent record with timestamp
 * - Link consent to child's account
 * - Periodic re-verification for ongoing consent
 */
const ParentalConsentModal: React.FC<ParentalConsentModalProps> = ({
    isOpen,
    onClose,
    onConsentGiven,
}) => {
    const { setParentalConsentGiven, setParentalConsentEmail } = useUserStore();
    const [step, setStep] = useState<'intro' | 'parent-form' | 'sent'>('intro');
    const [parentEmail, setParentEmail] = useState('');
    const [parentPhone, setParentPhone] = useState('');

    const handleParentClick = () => {
        setStep('parent-form');
    };

    const handleSendRequest = () => {
        // MOCKED: In real app, this would send verification email/SMS
        if (parentEmail) {
            setParentalConsentEmail(parentEmail);
            setStep('sent');

            // After a delay, mock that consent was given
            setTimeout(() => {
                setParentalConsentGiven(true);
                onConsentGiven();
            }, 2000);
        }
    };

    const handleClose = () => {
        setStep('intro');
        setParentEmail('');
        setParentPhone('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>

                            {step === 'intro' && (
                                <div className="space-y-6">
                                    <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        {kidCopy.parentalConsentTitle} 👨‍👩‍👧
                                    </DialogTitle>

                                    <div className="space-y-4">
                                        <p className="text-base text-slate-600 dark:text-slate-400">
                                            {kidCopy.parentalConsentWhy}
                                        </p>

                                        <div className="bg-white dark:bg-slate-700 rounded-xl p-4 space-y-3 border-2 border-primary-200 dark:border-primary-600">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                Here's what we'll do:
                                            </p>
                                            <ul className="space-y-2">
                                                {kidCopy.parentalConsentSteps.map((stepText, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                                                            {index + 1}
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                                            {stepText}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4">
                                        <KidButton
                                            onClick={handleParentClick}
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                        >
                                            {kidCopy.imAParent}
                                        </KidButton>
                                        <KidButton
                                            onClick={handleClose}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            I'll ask my parent later
                                        </KidButton>
                                    </div>
                                </div>
                            )}

                            {step === 'parent-form' && (
                                <div className="space-y-6">
                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        Parent Information
                                    </DialogTitle>

                                    <div className="space-y-4">
                                        <KidInput
                                            type="email"
                                            label="Parent Email"
                                            placeholder="parent@example.com"
                                            value={parentEmail}
                                            onChange={(e) => setParentEmail(e.target.value)}
                                        />

                                        <KidInput
                                            type="tel"
                                            label="Parent Phone (Optional)"
                                            placeholder="+1 (555) 123-4567"
                                            value={parentPhone}
                                            onChange={(e) => setParentPhone(e.target.value)}
                                        />

                                        <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-600">
                                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                                <strong className="text-slate-900 dark:text-slate-100">Note:</strong> We'll send a verification message to confirm you're the parent or guardian. This helps keep kids safe online.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <KidButton
                                            onClick={() => setStep('intro')}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Back
                                        </KidButton>
                                        <KidButton
                                            onClick={handleSendRequest}
                                            variant="primary"
                                            size="lg"
                                            className="flex-1"
                                            disabled={!parentEmail}
                                        >
                                            {kidCopy.sendConsentRequest}
                                        </KidButton>
                                    </div>
                                </div>
                            )}

                            {step === 'sent' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mx-auto"
                                    >
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {kidCopy.consentRequestSent} ✅
                                    </DialogTitle>

                                    <p className="text-base text-slate-600 dark:text-slate-400">
                                        We've sent a message to {parentEmail}. Once your parent verifies, you can start learning!
                                    </p>

                                    <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-600">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                            <strong className="text-slate-900 dark:text-slate-100">MOCKED:</strong> In the real app, we'd wait for parent verification. For now, you can proceed!
                                        </p>
                                    </div>

                                    <KidButton
                                        onClick={onConsentGiven}
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Continue
                                    </KidButton>
                                </motion.div>
                            )}
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default ParentalConsentModal;

