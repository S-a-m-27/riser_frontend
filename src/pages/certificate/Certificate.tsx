import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Award, Share2, ArrowLeft, Trophy, Target, Brain, Loader2, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useUserStore } from '../../store/userStore';
import { ROUTES } from '../../router/routeMap';
import { useToastContext } from '../../contexts/ToastContext';

import { API_BASE_URL } from '../../config/api';

interface AchievementBadge {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const achievementBadges: AchievementBadge[] = [
    {
        id: 'simulation',
        label: 'Completed Simulation',
        icon: Trophy,
    },
    {
        id: 'quiz',
        label: 'Knowledge Quiz Passed',
        icon: Brain,
    },
    {
        id: 'risk',
        label: 'Risk Recognition Achieved',
        icon: Target,
    },
];

// API Types
interface CertificateData {
    id: string;
    certificate_id: string;
    user_id: string;
    user_name: string;
    module: string;
    module_title: string;
    issued_at: string;
    completion_date: string;
    overall_score: number;
    badge_name: string;
    badge_description: string | null;
}

interface CertificateStats {
    final_score: number;
    best_category: string;
    quiz_score: number;
    puzzle_score: number;
    simulation_score: number;
}

interface CertificateResponse {
    certificate: CertificateData;
    stats: CertificateStats;
}

const Certificate: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToastContext();
    const { userName } = useUserStore();
    
    // Get module parameter and clean it (remove any colons, hashes, or invalid characters)
    const rawModule = searchParams.get('module') || 'flood';
    const module = rawModule.split(':')[0].split('#')[0].trim().toLowerCase();
    
    console.log('[Certificate] Module parameter', { rawModule, cleanedModule: module });
    
    // State
    const [certificateData, setCertificateData] = useState<CertificateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch certificate data
    useEffect(() => {
        const fetchCertificate = async () => {
            console.log('[Certificate] Starting certificate fetch', { module, rawModule });
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('access_token');
                console.log('[Certificate] Token check', { hasToken: !!token, tokenLength: token?.length });
                
                if (!token) {
                    console.warn('[Certificate] No access token found, redirecting to login');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }

                // Validate and clean module name (only allow alphanumeric and hyphens)
                const validModule = module.replace(/[^a-z0-9-]/g, '') || 'flood';
                if (validModule !== module) {
                    console.warn('[Certificate] Invalid module parameter detected, using cleaned version', { 
                        original: module, 
                        cleaned: validModule 
                    });
                }

                const apiUrl = `${API_BASE_URL}/api/certificate/${validModule}`;
                console.log('[Certificate API] Base URL:', API_BASE_URL);
                console.log('[Certificate API] Full URL:', apiUrl);
                console.log('[Certificate] Making API request', { 
                    url: apiUrl,
                    module: validModule 
                });

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('[Certificate] API response received', { 
                    status: response.status, 
                    ok: response.ok,
                    statusText: response.statusText 
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.warn('[Certificate] Unauthorized, removing token and redirecting to login');
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        navigate(ROUTES.AUTH.LOGIN);
                        return;
                    }
                    
                    const errorData = await response.json();
                    console.error('[Certificate] API error response', { 
                        status: response.status, 
                        error: errorData 
                    });
                    throw new Error(errorData.detail || 'Failed to fetch certificate');
                }

                const data: CertificateResponse = await response.json();
                console.log('[Certificate] Certificate data received successfully', { 
                    certificate_id: data.certificate.certificate_id,
                    module: data.certificate.module,
                    user_name: data.certificate.user_name,
                    overall_score: data.stats.final_score
                });
                
                setCertificateData(data);
            } catch (err) {
                const errorMessage = (err as Error).message || 'Failed to load certificate';
                console.error('[Certificate] Error fetching certificate', { 
                    error: err,
                    message: errorMessage,
                    module 
                });
                setError(errorMessage);
                // Only show toast if error is not authentication-related (to avoid spam)
                if (!errorMessage.includes('Not authenticated') && !errorMessage.includes('Unauthorized')) {
                    toast.error('Failed to load certificate. Please try again.');
                }
            } finally {
                setIsLoading(false);
                console.log('[Certificate] Fetch completed', { module });
            }
        };

        fetchCertificate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module]); // Removed toast from dependencies to prevent infinite loops

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const displayName = certificateData?.certificate.user_name || userName || 'User';
    const completionDate = certificateData?.certificate.completion_date 
        ? formatDate(certificateData.certificate.completion_date)
        : '';
    const stats = certificateData?.stats || {
        final_score: 0,
        best_category: '',
        quiz_score: 0,
        puzzle_score: 0,
        simulation_score: 0,
    };

    const handleDownload = async () => {
        if (!certificateData) {
            toast.warning('Certificate data not available');
            return;
        }

        try {
            console.log('[Certificate] Starting PDF download', { module });
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Please log in to download your certificate');
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            // Validate and clean module name
            const validModule = module.replace(/[^a-z0-9-]/g, '') || 'flood';
            const downloadUrl = `${API_BASE_URL}/api/certificate/${validModule}/download`;

            console.log('[Certificate] Downloading PDF from', downloadUrl);

            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to download certificate');
            }

            // Get the PDF blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `RISER_Certificate_${certificateData.certificate.certificate_id}_${validModule}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('[Certificate] PDF downloaded successfully');
            toast.success('Certificate downloaded successfully!');
        } catch (err) {
            console.error('[Certificate] Error downloading PDF', err);
            toast.error('Failed to download certificate. Please try again.');
        }
    };

    const handleShare = async () => {
        if (!certificateData) return;
        
        const moduleTitle = certificateData.certificate.module_title;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'RISER Certificate',
                    text: `I completed the ${moduleTitle} on RISER!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Certificate link copied to clipboard!');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading certificate...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !certificateData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Card variant="elevated" className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Certificate Not Available
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {error || 'Please complete the module first to receive your certificate.'}
                        </p>
                        <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4 relative overflow-hidden">
            {/* Celebration Confetti */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            y: -100,
                            x: Math.random() * window.innerWidth,
                            opacity: 1,
                            rotate: 0
                        }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: 0,
                            rotate: 360
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            delay: Math.random() * 0.5,
                            repeat: Infinity,
                            repeatDelay: 4,
                        }}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                            backgroundColor: ['#3B82F6', '#10B981', '#FACC15', '#FB923C'][Math.floor(Math.random() * 4)],
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>
            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8 md:space-y-12"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-block mb-4"
                        >
                            <div className="relative">
                                <Award className="w-16 h-16 md:w-20 md:h-20 text-yellow-500 relative z-10" />
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
                                />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                            Your Certificate 🎓
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                            Congratulations! You're becoming a resilience hero! 🦸✨
                        </p>
                    </div>

                    {/* Certificate Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 15,
                            delay: 0.2,
                        }}
                        className="flex justify-center"
                    >
                        <Card
                            variant="elevated"
                            className="w-full max-w-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-4 border-yellow-400 dark:border-yellow-500 shadow-2xl relative overflow-hidden"
                        >
                            {/* Paper texture overlay */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(
                                            0deg,
                                            transparent,
                                            transparent 2px,
                                            rgba(0,0,0,0.1) 2px,
                                            rgba(0,0,0,0.1) 4px
                                        )`,
                                    }}
                                />
                            </div>

                            {/* Decorative border pattern */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 dark:border-yellow-500" />
                                <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-400 dark:border-yellow-500" />
                                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-yellow-400 dark:border-yellow-500" />
                                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-yellow-400 dark:border-yellow-500" />
                            </div>

                            <CardContent className="p-8 md:p-12 relative z-10">
                                <div className="text-center space-y-8">
                                    {/* RISER Logo Placeholder */}
                                    <div className="flex justify-center">
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <span className="text-3xl md:text-4xl font-bold text-white">R</span>
                                        </div>
                                    </div>

                                    {/* Certificate Title */}
                                    <div className="space-y-2">
                                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                                            Certificate of Completion
                                        </h2>
                                        <p className="text-lg text-slate-600 dark:text-slate-400">
                                            This certifies that
                                        </p>
                                    </div>

                                    {/* User Name */}
                                    <div className="py-4 border-y-2 border-yellow-400 dark:border-yellow-500">
                                        <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                            {displayName}
                                        </h3>
                                    </div>

                                    {/* Module Info */}
                                    <div className="space-y-4">
                                        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300">
                                            has successfully completed
                                        </p>
                                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                            {certificateData.certificate.module_title}
                                        </p>
                                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
                                            on {completionDate}
                                        </p>
                                    </div>

                                    {/* Signature/Badge Area */}
                                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-2">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    RISER Platform
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-right">
                                            <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-2">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Certificate ID: {certificateData.certificate.certificate_id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Share & Download Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                onClick={handleDownload}
                                className="w-full sm:w-auto min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download Certificate
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={handleShare}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Share Achievement
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate(ROUTES.DASHBOARD)}
                                className="w-full sm:w-auto min-w-[200px] h-12"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Dashboard
                                </span>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Achievement Badges Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
                            Achievements Earned
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {achievementBadges.map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        className="flex-shrink-0"
                                    >
                                        <Card variant="outline" className="w-48 h-32 hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center space-y-2">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {badge.label}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Optional Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card variant="elevated">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
                                    Your Highlights
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Final Score</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                            {Math.round(stats.final_score)}
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <Target className="w-8 h-8 text-blue-500 mx-auto" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Best Category</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {stats.best_category}
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <Award className="w-8 h-8 text-yellow-500 mx-auto" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Badge</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {certificateData.certificate.badge_name}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Certificate;

