import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../router/routeMap';

import { API_BASE_URL } from '../../config/api';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('API: Login request', { email });
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if email is not verified
                if (response.status === 403 && data.detail?.includes('not verified')) {
                    // Check if verification code was resent
                    const codeResent = data.detail?.includes('new verification code has been sent');
                    
                    // Store email and redirect to verify page
                    localStorage.setItem('pendingVerificationEmail', email.trim());
                    
                    // Show appropriate message
                    if (codeResent) {
                        // Code was resent - set flag for verify page to show success message
                        localStorage.setItem('verificationCodeResent', 'true');
                        setError('A new verification code has been sent to your email. Redirecting to verification page...');
                    } else {
                        // Code was not resent (rate limit or error)
                        setError(data.detail || 'Email not verified. Please verify your email before logging in.');
                    }
                    
                    // Redirect to verify page after a short delay to show message
                    setTimeout(() => {
                        navigate('/verify');
                    }, 2000);
                    return;
                }
                throw new Error(data.detail || 'Login failed');
            }

            console.log('API: Login success', { email: data.user.email });

            // Store token and user data
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Check if user has selected avatar (first-time login)
            if (!data.user.has_selected_avatar) {
                // First-time user: redirect to avatar selection
                console.log('First-time user, redirecting to avatar selection');
                navigate(ROUTES.AUTH.SELECT_AVATAR);
            } else {
                // Returning user: redirect to dashboard
                console.log('Returning user, redirecting to dashboard');
                navigate(ROUTES.DASHBOARD);
            }
        } catch (error: any) {
            console.error('API: Login error', error);
            setError(error.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
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
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg"
                        >
                            <LogIn className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Welcome Back!
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Great to see you again! Let's continue your resilience journey.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>
                                <Link
                                    to="#"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log('Forgot password clicked');
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-400 hover:to-green-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                            disabled={isLoading}
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
