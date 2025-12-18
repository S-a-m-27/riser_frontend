import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, Lock, Eye, EyeOff, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AvatarCard from '../../components/avatar/AvatarCard';
import { ROUTES } from '../../router/routeMap';
import { useUserStore } from '../../store/userStore';
import { useAvatarStore } from '../../store/avatarStore';
import { useToastContext } from '../../contexts/ToastContext';
import { API_BASE_URL } from '../../config/api';

// Avatar generation function (same as SelectAvatar)
const generateAvatarUrl = (index: number) => {
    const styles = [
        'adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei',
        'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'shapes'
    ];
    const seeds = [
        'alex', 'blake', 'casey', 'dana', 'eli', 'finley',
        'gray', 'harper', 'ivy', 'jordan', 'kai', 'logan'
    ];
    return `https://api.dicebear.com/7.x/${styles[index]}/svg?seed=${seeds[index]}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=20`;
};

const avatars = Array.from({ length: 12 }, (_, i) => ({
    id: `avatar-${i + 1}`,
    url: generateAvatarUrl(i),
    name: ['Alex', 'Blake', 'Casey', 'Dana', 'Eli', 'Finley', 'Gray', 'Harper', 'Ivy', 'Jordan', 'Kai', 'Logan'][i],
}));

const UserSettings: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToastContext();
    const { userName, setUserName } = useUserStore();
    const { selectedAvatar, setAvatar } = useAvatarStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.user?.name || userName || '',
                        email: data.user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    });
                    // Set current avatar
                    const currentAvatar = data.user?.avatar || selectedAvatar;
                    setSelectedAvatarId(currentAvatar);
                    if (currentAvatar) {
                        setAvatar(currentAvatar);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, userName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate(ROUTES.AUTH.LOGIN);
            return;
        }

        // Validate password change if new password is provided
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                toast.error('Please enter your current password');
                setIsSaving(false);
                return;
            }
            if (formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long');
                setIsSaving(false);
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                setIsSaving(false);
                return;
            }
        }

        try {
            // Update name
            if (formData.name) {
                const nameResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                    }),
                });

                if (nameResponse.ok) {
                    setUserName(formData.name);
                    toast.success('Name updated successfully!');
                }
            }

            // Update password if provided
            if (formData.newPassword) {
                const passwordResponse = await fetch(`${API_BASE_URL}/api/user/password`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        current_password: formData.currentPassword,
                        new_password: formData.newPassword,
                    }),
                });

                if (!passwordResponse.ok) {
                    const errorData = await passwordResponse.json();
                    throw new Error(errorData.detail || 'Failed to update password');
                }
                toast.success('Password updated successfully!');
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            }

            // Update avatar if changed
            if (selectedAvatarId && selectedAvatarId !== selectedAvatar) {
                const avatarResponse = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        avatar: selectedAvatarId,
                    }),
                });

                if (avatarResponse.ok) {
                    setAvatar(selectedAvatarId);
                    toast.success('Avatar updated successfully!');
                }
            }

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error((error as Error).message || 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2"
                        >
                            User Settings
                        </motion.h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Manage your account information and preferences
                        </p>
                    </div>

                    {/* Settings Form */}
                    <Card variant="elevated" className="p-6 md:p-8">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <User className="w-6 h-6 text-blue-500" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email"
                                            disabled
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Email cannot be changed
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Change Section */}
                    <Card variant="elevated" className="p-6 md:p-8">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Lock className="w-6 h-6 text-blue-500" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword.current ? 'text' : 'password'}
                                            value={formData.currentPassword}
                                            onChange={(e) => handleChange('currentPassword', e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={formData.newPassword}
                                            onChange={(e) => handleChange('newPassword', e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter new password (min 6 characters)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avatar Selection Section */}
                    <Card variant="elevated" className="p-6 md:p-8">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Image className="w-6 h-6 text-blue-500" />
                                Change Avatar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {avatars.map((avatar, index) => (
                                    <AvatarCard
                                        key={avatar.id}
                                        id={avatar.id}
                                        imageUrl={avatar.url}
                                        name={avatar.name}
                                        isSelected={selectedAvatarId === avatar.id}
                                        onClick={() => {
                                            setSelectedAvatarId(avatar.id);
                                            setAvatar(avatar.id);
                                        }}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-center pt-4">
                        <form onSubmit={handleSubmit}>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSaving}
                                className="min-w-[200px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save All Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserSettings;
