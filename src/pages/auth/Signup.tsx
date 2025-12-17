import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { cn } from '../../lib/utils';
import { useToastContext } from '../../contexts/ToastContext';

import { API_BASE_URL } from '../../config/api';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToastContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        passwordMatch?: string;
        email?: string;
        password?: string;
        name?: string;
        api?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        // Name validation
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (password && confirmPassword && password !== confirmPassword) {
            newErrors.passwordMatch = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!acceptedTerms) {
            toast.warning('Please accept the Terms & Conditions to continue');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({ ...errors, api: undefined });

        try {
            console.log('API: Signup request', { email, hasName: !!name });
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                    ...(name.trim() && { name: name.trim() }),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Signup failed');
            }

            console.log('API: Signup success', data);

            // Store email for verification step
            localStorage.setItem('pendingVerificationEmail', email.trim());

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAcceptedTerms(false);
            setErrors({});

            // Redirect to verify email page
            navigate('/verify');
        } catch (error: any) {
            console.error('API: Signup error', error);
            setErrors({ ...errors, api: error.message || 'Failed to create account. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        // Clear password match error when user starts typing
        if (errors.passwordMatch) {
            setErrors({ ...errors, passwordMatch: undefined });
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        // Real-time validation for password match
        if (password && value && password !== value) {
            setErrors({ ...errors, passwordMatch: 'Passwords do not match' });
        } else if (password && value && password === value) {
            setErrors({ ...errors, passwordMatch: undefined });
        }
    };

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
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-800/10 rounded-full blur-3xl"
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
                    <div className="text-center space-y-2">
                        <div className="relative inline-block mb-4">
                            {/* Animated ring */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 opacity-20 blur-xl"
                            />
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 rounded-full border-2 border-blue-300 dark:border-blue-700 opacity-30"
                            />
                            {/* Main icon container */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, -10, 10, -10, 0],
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 dark:from-blue-600 dark:via-blue-700 dark:to-purple-700 rounded-full shadow-lg cursor-pointer group"
                            >
                                {/* Shine effect */}
                                <motion.div
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]"
                                />
                                {/* Icon with pulse effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <UserPlus className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                                </motion.div>
                                {/* Hover glow effect */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-50 -z-10"
                                />
                            </motion.div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Create Your Account
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Join RISER and start your resilience journey!
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className={cn(
                                        "pl-10",
                                        errors.name && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={cn(
                                        "pl-10",
                                        errors.email && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    required
                                    className={cn(
                                        "pl-10",
                                        errors.password && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                    required
                                    className={cn(
                                        "pl-10",
                                        errors.passwordMatch && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                            </div>
                            {errors.passwordMatch && (
                                <p className="text-sm text-red-500">{errors.passwordMatch}</p>
                            )}
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-0.5"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                            >
                                I agree to the{' '}
                                <Link
                                    to="#"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log('Terms & Conditions clicked');
                                    }}
                                >
                                    Terms & Conditions
                                </Link>
                            </label>
                        </div>

                        {/* API Error Message */}
                        {errors.api && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.api}</p>
                            </div>
                        )}

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-400 hover:to-green-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                            disabled={isLoading}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
