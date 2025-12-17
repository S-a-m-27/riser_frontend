import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, RotateCcw } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerified, setIsVerified] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Get email from localStorage (set during signup or login)
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            setEmail(pendingEmail);
            
            // Check if code was just resent (from login redirect)
            // This is indicated by a flag in localStorage
            const codeJustResent = localStorage.getItem('verificationCodeResent');
            if (codeJustResent === 'true') {
                setSuccessMessage('A new verification code has been sent to your email. Please check your inbox.');
                localStorage.removeItem('verificationCodeResent');
                // Clear message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } else {
            // If no email found, redirect to signup
            console.warn('No pending verification email found, redirecting to signup');
            navigate('/signup');
        }
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, [navigate]);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 6 digits are entered
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            // Small delay for better UX
            setTimeout(() => {
                handleVerify(newOtp.join(''));
            }, 300);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newOtp = [...otp];
                digits.forEach((digit, i) => {
                    if (i < 6) {
                        newOtp[i] = digit;
                    }
                });
                setOtp(newOtp);
                if (digits.length === 6) {
                    inputRefs.current[5]?.focus();
                    setTimeout(() => {
                        handleVerify(newOtp.join(''));
                    }, 300);
                } else {
                    inputRefs.current[digits.length]?.focus();
                }
            });
        }
    };

    const handleVerify = async (code?: string) => {
        const codeToVerify = code || otp.join('');

        if (codeToVerify.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        if (!email) {
            setError('Email not found. Please sign up again.');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            console.log('API: Verify email request', { email });
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    verification_code: codeToVerify,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Verification failed');
            }

            console.log('API: Verify email success', data);
            setIsVerified(true);
            setError('');

            // Clear pending email from localStorage
            localStorage.removeItem('pendingVerificationEmail');
        } catch (error: any) {
            console.error('API: Verify email error', error);
            setError(error.message || 'Invalid verification code. Please try again.');
            // Clear OTP and refocus first input
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Email not found. Please sign up again.');
            return;
        }

        setIsResending(true);
        setOtp(['', '', '', '', '', '']);
        setError('');
        setSuccessMessage('');

        try {
            console.log('API: Resend verification code requested', { email });
            
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle rate limiting
                if (response.status === 429) {
                    throw new Error(data.detail || 'Please wait before requesting a new code. Try again in a minute.');
                }
                throw new Error(data.detail || 'Failed to resend verification code');
            }

            console.log('API: Resend verification code success', data);
            
            // Show success message
            setSuccessMessage(data.message || 'Verification code has been resent to your email. Please check your inbox.');
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
            
            // Focus first input
            inputRefs.current[0]?.focus();
            
        } catch (error: any) {
            console.error('API: Resend error', error);
            setError(error.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12 relative overflow-hidden">
                {/* Celebration confetti effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
                            animate={{ y: window.innerHeight + 100, opacity: 0 }}
                            transition={{
                                duration: Math.random() * 2 + 1,
                                delay: Math.random() * 0.5,
                                repeat: Infinity,
                            }}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: ['#3B82F6', '#10B981', '#FACC15', '#FB923C'][Math.floor(Math.random() * 4)],
                                left: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 text-center border border-green-100 dark:border-slate-700">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ delay: 0.4, type: "spring", repeat: 2 }}
                            >
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </motion.div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                        >
                            Email Verified! 🎉
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg text-slate-600 dark:text-slate-400"
                        >
                            Nice! You're almost there! Your email is verified. Let's continue your journey.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Button
                                onClick={() => {
                                    // Redirect to login page
                                    navigate('/login');
                                }}
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 shadow-lg hover:shadow-xl"
                                size="lg"
                            >
                                Continue to Login
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-2xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-20 right-10 w-40 h-40 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-2xl"
                />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-blue-100 dark:border-slate-700">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg"
                        >
                            <Mail className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Verify Your Email
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            We've sent a 6-digit code to <strong>{email || 'your email'}</strong>. Check your inbox!
                        </p>
                    </div>

                    {/* OTP Inputs */}
                    <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                            {otp.map((digit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                >
                                    <Input
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={cn(
                                            "w-14 h-16 text-center text-2xl font-bold p-0 rounded-xl",
                                            error && "border-red-500 focus-visible:ring-red-500",
                                            digit && "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        )}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Success Message (Code Resent) */}
                        <AnimatePresence>
                            {successMessage && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-sm text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {successMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-sm text-red-500 text-center"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            onClick={() => handleVerify()}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-400 hover:to-green-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                            disabled={otp.some(digit => !digit) || isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify'}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleResend}
                            variant="outline"
                            className="w-full h-11"
                            disabled={isResending}
                        >
                            <RotateCcw className={cn(
                                "w-4 h-4 mr-2",
                                isResending && "animate-spin"
                            )} />
                            {isResending ? 'Resending...' : 'Resend Code'}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Didn't receive the code? Check your spam folder or click "Resend Code"
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
