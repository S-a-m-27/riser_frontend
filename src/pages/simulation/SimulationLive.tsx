import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    TrendingUp,
    Users,
    Target,
    Pause,
    LogOut,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    AlertCircle,
    Loader2,
    AlertTriangle,
    Copy,
    Share2,
    Info,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../../components/ui/Dialog';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';
import { getSceneImage } from '../../utils/sceneImages';

import { API_BASE_URL } from '../../config/api';

// API Types
interface Choice {
    key: string;
    label: string;
}

interface SceneData {
    scene_type: string;
    scene_title: string;
    scene_description: string;
    image_key: string;
    choices: Choice[];
    stress_level: number;
    morale: number;
    time_remaining: number;
    scene_key?: string; // Optional: scene key like "home_1"
}

interface DecisionResponse {
    updated_stress: number;
    updated_morale: number;
    time_remaining: number;
    status: 'ongoing' | 'failed' | 'success';
}

const SimulationLive: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // API state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [, setLastSceneKey] = useState<string | null>(null);
    const [sceneData, setSceneData] = useState<SceneData | null>(null);
    const isRefreshingScene = useRef(false); // Prevent multiple simultaneous scene refreshes
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simulation state
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
    const [stress, setStress] = useState(20);
    const [morale, setMorale] = useState(80);
    const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTeamVote, setShowTeamVote] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState<'ongoing' | 'failed' | 'success'>('ongoing');
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Multiplayer state
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [participants, setParticipants] = useState<Array<{ user_id: string; email: string; role: string; joined_at: string }>>([]);
    const [voteStatus, setVoteStatus] = useState<{
        scene_key: string;
        status: 'voting' | 'resolved' | 'timeout';
        votes: Record<string, number>;
        participants_voted: string[];
        participants_pending: string[];
        resolved_decision: string | null;
        simulation_status?: 'ongoing' | 'success' | 'failed';
        is_completed?: boolean;
    } | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isSubmittingVote, setIsSubmittingVote] = useState(false);
    const [sessionIdCopied, setSessionIdCopied] = useState(false);

    // Memoize image path to prevent repeated calculations and logs
    // MUST be called before any conditional returns (Rules of Hooks)
    const sceneImagePath = useMemo(() => {
        if (!sceneData) return '';
        return getSceneImage(sceneData.image_key, sceneData.scene_type);
    }, [sceneData?.image_key, sceneData?.scene_type]);

    // Fetch scene data from API
    const fetchSceneData = useCallback(async (sessionId: string) => {
        console.log('fetchSceneData called with sessionId:', sessionId);
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            const url = `${API_BASE_URL}/simulation/scene/${sessionId}`;
            console.log('Fetching scene from URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                console.error('Error response:', errorData);
                throw new Error(errorData.detail || 'Failed to fetch scene data');
            }

            const data: SceneData = await response.json();
            console.log('📋 Scene data received:', {
                scene_type: data.scene_type,
                image_key: data.image_key,
                scene_title: data.scene_title,
                scene_description: data.scene_description,
                choices_count: data.choices.length,
                stress_level: data.stress_level,
                morale: data.morale,
                time_remaining: data.time_remaining
            });
            
            // Calculate expected image path for logging (only once when scene changes)
            const expectedImagePath = getSceneImage(data.image_key, data.scene_type, true);
            console.log('🖼️ Scene Image: Expected image path', {
                image_key: data.image_key,
                scene_type: data.scene_type,
                expected_path: expectedImagePath,
                full_url: `${window.location.origin}${expectedImagePath}`
            });
            
            setSceneData(data);
            // Update last scene key when scene data is fetched
            if (data.scene_key) {
                setLastSceneKey(data.scene_key);
            }
            // Reset image state for new scene
            setImageError(false);
            setImageLoading(true);
            // Reset refresh flag when scene data is successfully loaded
            isRefreshingScene.current = false;
            console.log('🔄 Image state reset: loading=true, error=false');
            setTimeLeft(data.time_remaining);
            setStress(data.stress_level);
            setMorale(data.morale);

        } catch (err) {
            console.error('Error fetching scene:', err);
            setError((err as Error).message || 'Failed to load simulation');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    // Fetch participants for multiplayer sessions
    const fetchParticipants = useCallback(async (sessionId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/simulation/${sessionId}/participants`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setParticipants(data.participants || []);
                setIsMultiplayer(data.participants.length > 0);
                console.log('[MULTIPLAYER] Participants loaded:', data.participants);
            } else if (response.status === 400) {
                // Not a multiplayer session, that's fine
                setIsMultiplayer(false);
            }
        } catch (err) {
            console.warn('[MULTIPLAYER] Failed to fetch participants:', err);
            setIsMultiplayer(false);
        }
    }, []);

    // Fetch vote status for multiplayer sessions
    // Use refs to avoid dependency issues that cause repeated calls
    const fetchSceneDataRef = useRef(fetchSceneData);
    const fetchParticipantsRef = useRef(fetchParticipants);
    const navigateRef = useRef(navigate);
    
    // Update refs when functions change
    useEffect(() => {
        fetchSceneDataRef.current = fetchSceneData;
        fetchParticipantsRef.current = fetchParticipants;
        navigateRef.current = navigate;
    }, [fetchSceneData, fetchParticipants, navigate]);
    
    const fetchVoteStatus = useCallback(async (sessionId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/simulation/${sessionId}/vote-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                // Get current values using functional updates to avoid stale closures
                setVoteStatus((prevVoteStatus) => {
                    setLastSceneKey((prevLastSceneKey) => {
                        const previousSceneKey = prevLastSceneKey || prevVoteStatus?.scene_key;
                        const currentSceneKey = data.scene_key;
                        const sceneChanged = previousSceneKey && currentSceneKey && previousSceneKey !== currentSceneKey;
                        
                        // Get current user's email from localStorage
                        const userData = localStorage.getItem('user');
                        let currentUserEmail: string | null = null;
                        if (userData) {
                            try {
                                const user = JSON.parse(userData);
                                currentUserEmail = user.email || null;
                            } catch (e) {
                                console.warn('[MULTIPLAYER] Failed to parse user data from localStorage:', e);
                            }
                        }
                        
                        // Check if current user has voted by checking if their email is in participants_voted
                        const userHasVoted = currentUserEmail ? data.participants_voted.includes(currentUserEmail) : false;
                        
                        // Check if simulation is completed
                        const isCompleted = data.is_completed === true;
                        const simStatus = data.simulation_status as 'ongoing' | 'success' | 'failed' | undefined;
                        
                        console.log('[MULTIPLAYER] Vote status check:', {
                            currentUserEmail,
                            participants_voted: data.participants_voted,
                            userHasVoted,
                            status: data.status,
                            scene_key: data.scene_key,
                            previousSceneKey,
                            currentSceneKey,
                            sceneChanged,
                            isRefreshing: isRefreshingScene.current,
                            isCompleted,
                            simulation_status: simStatus
                        });
                        
                        setHasVoted(userHasVoted);
                        
                        // Update simulation status if provided
                        if (simStatus && simStatus !== 'ongoing') {
                            setSimulationStatus(simStatus);
                        }
                        
                        // If simulation is completed, navigate to results page
                        if (isCompleted && sessionId) {
                            console.log('[MULTIPLAYER] Simulation completed, navigating to results page');
                            // Small delay to ensure state is updated
                            setTimeout(() => {
                                navigateRef.current(`${ROUTES.SIMULATION.RESULT}?session_id=${sessionId}`);
                            }, 1000);
                            return; // Exit early to prevent further processing
                        }
                        
                        // If scene changed or resolved, refresh scene data (only once)
                        if ((sceneChanged || (data.status === 'resolved' && data.resolved_decision)) && !isRefreshingScene.current && !isCompleted) {
                            console.log('[MULTIPLAYER] Scene changed or resolved, refreshing scene data...', {
                                sceneChanged,
                                resolved: data.status === 'resolved',
                                previousSceneKey,
                                currentSceneKey
                            });
                            
                            isRefreshingScene.current = true;
                            
                            // Use a small delay to batch state updates
                            setTimeout(() => {
                                if (sessionId) {
                                    fetchSceneDataRef.current(sessionId);
                                    setHasVoted(false); // Reset for next scene
                                    setSelectedDecision(null); // Clear selected decision
                                    // Also refresh participants to get updated list
                                    fetchParticipantsRef.current(sessionId);
                                }
                            }, 500);
                        }
                        
                        // Update last scene key
                        return currentSceneKey || prevLastSceneKey;
                    });
                    
                    return data;
                });
            }
        } catch (err) {
            console.warn('[MULTIPLAYER] Failed to fetch vote status:', err);
        }
    }, []); // Empty dependencies - use refs instead

    // Get session_id from URL params or localStorage
    useEffect(() => {
        console.log('SimulationLive useEffect triggered');
        const urlSessionId = searchParams.get('session_id');
        const storedSessionId = localStorage.getItem('simulation_session_id');
        const id = urlSessionId || storedSessionId;

        console.log('Session ID from URL:', urlSessionId);
        console.log('Session ID from localStorage:', storedSessionId);
        console.log('Final session ID:', id);

        if (id) {
            setSessionId(id);
            localStorage.setItem('simulation_session_id', id);
            fetchSceneData(id);
            // Try to fetch participants (will fail silently if not multiplayer)
            fetchParticipants(id);
        } else {
            console.error('No session ID found');
            setError('No simulation session found. Please start a new simulation.');
            setIsLoading(false);
        }
    }, [searchParams, fetchSceneData, fetchParticipants]);

    // Poll vote status for multiplayer sessions
    useEffect(() => {
        // Stop polling if simulation is not ongoing or if it's completed
        if (!isMultiplayer || !sessionId || simulationStatus !== 'ongoing') {
            console.log('[MULTIPLAYER] Polling stopped:', { isMultiplayer, sessionId, simulationStatus });
            return;
        }

        const pollInterval = setInterval(() => {
            fetchVoteStatus(sessionId);
        }, 2000); // Poll every 2 seconds

        return () => {
            console.log('[MULTIPLAYER] Cleaning up poll interval');
            clearInterval(pollInterval);
        };
    }, [isMultiplayer, sessionId, simulationStatus, fetchVoteStatus]);

    // Check if image is already loaded from cache when scene changes
    useEffect(() => {
        if (!sceneImagePath) return;

        // Small delay to ensure image element is rendered
        const checkImageLoaded = () => {
            if (imageRef.current) {
                const img = imageRef.current;
                // If image is already loaded from cache, onLoad won't fire
                if (img.complete && img.naturalHeight !== 0) {
                    console.log('✅ Scene Image: Already loaded from cache', {
                        image_key: sceneData?.image_key,
                        scene_type: sceneData?.scene_type,
                        src: img.src
                    });
                    setImageLoading(false);
                    setImageError(false);
                    return;
                }
            }
            
            // Fallback: if image doesn't load within 5 seconds, stop showing loading state
            const timeout = setTimeout(() => {
                if (imageLoading) {
                    console.warn('⚠️ Scene Image: Loading timeout, assuming loaded', {
                        image_key: sceneData?.image_key,
                        scene_type: sceneData?.scene_type
                    });
                    setImageLoading(false);
                }
            }, 5000);

            return () => clearTimeout(timeout);
        };

        const timeoutId = setTimeout(checkImageLoaded, 100);
        return () => clearTimeout(timeoutId);
    }, [sceneImagePath, sceneData?.image_key, sceneData?.scene_type, imageLoading]);

    // Timer countdown
    useEffect(() => {
        if (simulationStatus !== 'ongoing' || timeLeft <= 0) {
            if (simulationStatus !== 'ongoing' && sessionId) {
                // Complete simulation when timer ends or status changes
                const completeSimulation = async () => {
                    try {
                        const token = localStorage.getItem('access_token');
                        if (token) {
                            await fetch(`${API_BASE_URL}/simulation/complete`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    session_id: sessionId,
                                }),
                            });
                        }
                    } catch (err) {
                        console.warn('Failed to complete simulation:', err);
                    }
                };
                completeSimulation();
                navigate(`${ROUTES.SIMULATION.RESULT}?session_id=${sessionId}`);
            }
            return;
        }

        if (isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isPaused, navigate, simulationStatus, sessionId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStressColor = (value: number) => {
        if (value < 30) return '#10b981'; // green
        if (value < 60) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    // Handle vote submission for multiplayer
    const handleVoteSubmit = async (decisionKey: string) => {
        // Prevent multiple submissions
        if (!sessionId || !sceneData || isSubmittingVote || hasVoted) {
            console.log('[VOTE] Vote submission blocked:', { 
                hasSessionId: !!sessionId, 
                hasSceneData: !!sceneData, 
                isSubmittingVote, 
                hasVoted 
            });
            return;
        }

        setIsSubmittingVote(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            // Get scene_key from sceneData (from backend) - this is the most reliable source
            // Backend expects scene_key to match current_voting_scene or current_scene_key
            const sceneKey = sceneData.scene_key || voteStatus?.scene_key;
            
            if (!sceneKey) {
                throw new Error('Scene key not available. Please refresh the page.');
            }
            
            console.log('[VOTE] Submitting vote:', { 
                decisionKey, 
                sceneKey, 
                sessionId, 
                sceneDataSceneKey: sceneData.scene_key,
                voteStatusSceneKey: voteStatus?.scene_key
            });

            const response = await fetch(`${API_BASE_URL}/simulation/${sessionId}/vote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decision_key: decisionKey,
                    scene_key: sceneKey,
                }),
            });

            const responseData = await response.json().catch(() => ({ detail: 'Unknown error' }));

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                
                // Handle "already voted" gracefully - don't show error, just update state
                if (response.status === 409 && responseData.detail?.includes('already voted')) {
                    console.log('[VOTE] Already voted for this scene, updating state');
                    setHasVoted(true);
                    setSelectedDecision(decisionKey);
                    // Refresh vote status to get current state
                    if (sessionId) {
                        fetchVoteStatus(sessionId);
                    }
                    setIsSubmittingVote(false);
                    return;
                }
                
                // Handle scene mismatch - might be due to scene progression
                if (response.status === 400 && responseData.detail?.includes('Scene mismatch')) {
                    console.log('[VOTE] Scene mismatch detected, refreshing scene data');
                    // Refresh scene data to get the correct scene
                    if (sessionId) {
                        await fetchSceneData(sessionId);
                    }
                    setToast({ message: 'Scene has changed. Please select your decision again.', type: 'info' });
                    setIsSubmittingVote(false);
                    return;
                }
                
                throw new Error(responseData.detail || 'Failed to submit vote');
            }

            const result = responseData;
            console.log('[VOTE] Vote submitted successfully:', result);

            setHasVoted(true);
            setSelectedDecision(decisionKey);

            // Refresh vote status
            if (sessionId) {
                fetchVoteStatus(sessionId);
            }

            // If resolved, the polling will handle scene refresh
            if (result.status === 'resolved') {
                // Find the decision label from sceneData choices
                const decisionLabel = sceneData?.choices.find(c => c.key === result.current_majority)?.label || result.current_majority;
                setToast({ message: `Team decision: ${decisionLabel}`, type: 'success' });
            } else {
                setToast({ message: 'Vote submitted! Waiting for team...', type: 'success' });
            }

            setTimeout(() => setToast(null), 3000);

        } catch (err) {
            console.error('[VOTE] Error submitting vote:', err);
            const errorMessage = (err as Error).message || 'Failed to submit vote';
            setError(errorMessage);
            setToast({ message: errorMessage, type: 'warning' });
            setTimeout(() => setToast(null), 5000);
        } finally {
            setIsSubmittingVote(false);
        }
    };

    const handleDecisionSelect = async (decisionKey: string) => {
        // If multiplayer, use vote endpoint instead
        if (isMultiplayer) {
            // Prevent multiple clicks
            if (isSubmittingVote || hasVoted) {
                console.log('[VOTE] Decision select blocked:', { isSubmittingVote, hasVoted });
                return;
            }
            handleVoteSubmit(decisionKey);
            return;
        }

        // Single-player logic (unchanged)
        if (selectedDecision || !sessionId || isSubmitting) return;

        setSelectedDecision(decisionKey);
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate(ROUTES.AUTH.LOGIN);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/simulation/decision`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    decision_key: decisionKey,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate(ROUTES.AUTH.LOGIN);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit decision');
            }

            const result: DecisionResponse = await response.json();

            // Save event to backend (new endpoint)
            try {
                await fetch(`${API_BASE_URL}/simulation/event`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        decision_key: decisionKey,
                        decision_value: decisionKey,
                    }),
                });
            } catch (eventErr) {
                console.warn('Failed to save event:', eventErr);
                // Non-critical, continue with simulation
            }

            // Update state from backend response
            setStress(result.updated_stress);
            setMorale(result.updated_morale);
            setTimeLeft(result.time_remaining);
            setSimulationStatus(result.status);

            // Show toast feedback
            const stressDelta = result.updated_stress - stress;
            const moraleDelta = result.updated_morale - morale;

            if (stressDelta > 0) {
                setToast({ message: 'This decision increased your stress', type: 'warning' });
            } else if (stressDelta < 0) {
                setToast({ message: 'Good choice! Stress reduced', type: 'success' });
            }

            if (moraleDelta > 0) {
                setToast({ message: 'Good choice! Morale improved', type: 'success' });
            } else if (moraleDelta < 0) {
                setToast({ message: 'This decision decreased morale', type: 'warning' });
            }

            // Auto-hide toast after 3 seconds
            setTimeout(() => setToast(null), 3000);

            // Check if simulation ended
            if (result.status !== 'ongoing') {
                // Complete simulation and calculate scores
                try {
                    await fetch(`${API_BASE_URL}/simulation/complete`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            session_id: sessionId,
                        }),
                    });
                } catch (completeErr) {
                    console.warn('Failed to complete simulation:', completeErr);
                    // Non-critical, continue to results
                }

                setTimeout(() => {
                    navigate(`${ROUTES.SIMULATION.RESULT}?session_id=${sessionId}`);
                }, 2000);
            } else {
                // Refresh scene data for next scene
                setTimeout(() => {
                    fetchSceneData(sessionId);
                    setSelectedDecision(null);
                }, 1500);
            }

        } catch (err) {
            console.error('Error submitting decision:', err);
            setError((err as Error).message || 'Failed to submit decision');
            setSelectedDecision(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePause = () => {
        setIsPaused(true);
        setShowPauseModal(true);
    };

    const handleResume = () => {
        setIsPaused(false);
        setShowPauseModal(false);
    };

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        localStorage.removeItem('simulation_session_id');
        navigate(ROUTES.DASHBOARD);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white text-lg">Loading simulation...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !sceneData) {
        return (
            <div className="h-screen w-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Error Loading Simulation</h2>
                    <p className="text-red-200 mb-6">{error}</p>
                    <Button onClick={() => navigate(ROUTES.SIMULATION.INTRO)}>
                        Go Back to Intro
                    </Button>
                </div>
            </div>
        );
    }

    if (!sceneData) {
        return (
            <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white text-lg">Loading scene data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
            {/* Sticky Top Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg"
            >
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Timer */}
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="flex items-center gap-3"
                        >
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {formatTime(timeLeft)}
                            </span>
                        </motion.div>

                        {/* Stress Bar */}
                        <div className="flex-1 min-w-[150px] max-w-[250px]">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4" style={{ color: getStressColor(stress) }} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Stress
                                </span>
                                <span
                                    className="text-xs font-bold ml-auto"
                                    style={{ color: getStressColor(stress) }}
                                >
                                    {stress}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: `${stress}%` }}
                                    animate={{ width: `${stress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getStressColor(stress) }}
                                />
                            </div>
                        </div>

                        {/* Morale Bar */}
                        <div className="flex-1 min-w-[150px] max-w-[250px]">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Morale
                                </span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-auto">
                                    {morale}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: `${morale}%` }}
                                    animate={{
                                        width: `${morale}%`,
                                        scaleY: morale > 70 ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Scene Display Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    {/* Scene Image Display - Fixed Size Window */}
                    <div className="flex-1 relative overflow-hidden bg-slate-200 dark:bg-slate-800 min-h-0" style={{ height: '100%' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={sceneData.image_key || sceneData.scene_type}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 w-full h-full"
                            >
                                {/* Scene Image */}
                                {!imageError ? (
                                    <>
                                        {imageLoading && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 flex items-center justify-center z-10">
                                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                                            </div>
                                        )}
                                        <img
                                            ref={imageRef}
                                            src={sceneImagePath}
                                            alt={sceneData.scene_title}
                                            className={cn(
                                                "w-full h-full object-contain transition-opacity duration-500",
                                                imageLoading ? "opacity-0" : "opacity-100"
                                            )}
                                            onLoad={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                console.log('✅ Scene Image: Successfully loaded', {
                                                    image_key: sceneData.image_key,
                                                    scene_type: sceneData.scene_type,
                                                    src: target.src,
                                                    naturalWidth: target.naturalWidth,
                                                    naturalHeight: target.naturalHeight
                                                });
                                                setImageLoading(false);
                                                setImageError(false);
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                const currentSrc = target.src;
                                                
                                                console.warn('❌ Scene Image: Failed to load', {
                                                    image_key: sceneData.image_key,
                                                    scene_type: sceneData.scene_type,
                                                    attempted_path: currentSrc
                                                });
                                                
                                                if (currentSrc.endsWith('.png')) {
                                                    // Try alternative naming (upper_floor vs upperfloor)
                                                    let altSrc = currentSrc;
                                                    if (currentSrc.includes('upperfloor')) {
                                                        // Try with underscore
                                                        altSrc = currentSrc.replace('upperfloor', 'upper_floor');
                                                        console.log('🔄 Scene Image: Trying alternative naming (with underscore)', altSrc);
                                                    } else if (currentSrc.includes('upper_floor')) {
                                                        // Try without underscore
                                                        altSrc = currentSrc.replace('upper_floor', 'upperfloor');
                                                        console.log('🔄 Scene Image: Trying alternative naming (without underscore)', altSrc);
                                                    }
                                                    
                                                    if (altSrc !== currentSrc) {
                                                        target.src = altSrc;
                                                        return;
                                                    }
                                                    
                                                    // Try JPG version
                                                    const jpgSrc = currentSrc.replace('.png', '.jpg');
                                                    console.log('🔄 Scene Image: Trying JPG format', jpgSrc);
                                                    target.src = jpgSrc;
                                                } else {
                                                    // Both PNG and JPG failed, use fallback
                                                    console.error('❌ Scene Image: All attempts failed, using gradient fallback', {
                                                        image_key: sceneData.image_key,
                                                        scene_type: sceneData.scene_type
                                                    });
                                                    setImageError(true);
                                                    setImageLoading(false);
                                                }
                                            }}
                                        />
                                    </>
                                ) : (
                                    // Fallback gradient background if image fails
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 flex items-center justify-center">
                                        <div className="text-center space-y-4">
                                            <div className="text-white/80 text-6xl md:text-8xl">
                                                🌊
                                            </div>
                                            <p className="text-white/60 text-sm">Scene Image</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Status HUD Sidebar */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full lg:w-80 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border-l border-white/20 flex flex-col overflow-hidden"
                >
                    <div className="p-4 pb-2 flex-shrink-0">
                        <h3 className="text-lg font-bold text-white">Status</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 custom-scrollbar-light">

                    {/* Stress Level */}
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5" style={{ color: getStressColor(stress) }} />
                            <span className="text-sm font-semibold text-white">Stress Level</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stress}%</div>
                    </div>

                    {/* Morale */}
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-green-400" />
                            <span className="text-sm font-semibold text-white">Morale</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{morale}%</div>
                    </div>

                    {/* Current Scene Type */}
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-semibold text-white">Scene Type</span>
                        </div>
                        <div className="text-sm text-white/80 capitalize">
                            {sceneData.scene_type.replace('_', ' ')}
                        </div>
                    </div>

                    {/* Session ID Panel (Only for multiplayer) */}
                    {sessionId && isMultiplayer && (
                        <div className="bg-white/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Share2 className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-semibold text-white">Session ID</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-black/20 px-2 py-1.5 rounded text-white/90 font-mono break-all">
                                    {sessionId}
                                </code>
                                <button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(sessionId);
                                            setSessionIdCopied(true);
                                            setTimeout(() => setSessionIdCopied(false), 2000);
                                        } catch (err) {
                                            console.error('Failed to copy:', err);
                                        }
                                    }}
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                    title="Copy Session ID"
                                >
                                    {sessionIdCopied ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-white/70 hover:text-white" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-white/60 mt-2">
                                Share this ID with others to join
                            </p>
                        </div>
                    )}

                    {/* Multiplayer Participants Panel */}
                    {isMultiplayer && (
                        <div className="bg-white/10 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setShowTeamVote(!showTeamVote)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Team ({participants.length})
                                </span>
                                {showTeamVote ? (
                                    <ChevronUp className="w-4 h-4 text-white" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-white" />
                                )}
                            </button>
                            <AnimatePresence>
                                {showTeamVote && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-3 border-t border-white/20 space-y-2"
                                    >
                                        {participants.map((p) => (
                                            <div key={p.user_id} className="flex items-center justify-between text-sm">
                                                <span className="text-white/90">{p.email}</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-xs",
                                                    p.role === 'leader' 
                                                        ? "bg-yellow-500/20 text-yellow-300" 
                                                        : "bg-blue-500/20 text-blue-300"
                                                )}>
                                                    {p.role}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Vote Status Panel (Multiplayer) */}
                    {isMultiplayer && voteStatus && (
                        <div className="bg-white/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-semibold text-white">Vote Status</span>
                            </div>
                            {voteStatus.status === 'voting' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-white/80">
                                        Waiting for {voteStatus.participants_pending.length} more vote(s)
                                    </p>
                                    {Object.entries(voteStatus.votes).map(([decision, count]) => (
                                        <div key={decision} className="flex items-center justify-between text-xs">
                                            <span className="text-white/70 truncate">{decision}</span>
                                            <span className="text-white font-bold">{count}</span>
                                        </div>
                                    ))}
                                    {hasVoted && (
                                        <p className="text-xs text-green-400 mt-2">✓ You voted</p>
                                    )}
                                </div>
                            )}
                            {voteStatus.status === 'resolved' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-green-400 font-semibold">
                                        ✓ Decision: {voteStatus.resolved_decision}
                                    </p>
                                    <p className="text-xs text-white/60">Moving to next scene...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Single Player Message */}
                    {!isMultiplayer && (
                        <div className="bg-white/10 rounded-lg overflow-hidden">
                            <div className="p-3">
                                <p className="text-sm text-white/80">
                                    You are playing solo. Team voting will be available in multiplayer mode.
                                </p>
                            </div>
                        </div>
                    )}
                    </div>
                </motion.div>
            </div>

            {/* Scrollable Content Section - Text and Decision Buttons */}
            <div className="flex-shrink-0 overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 max-h-[40vh] custom-scrollbar">
                {/* Scene Title and Description Card - Above Decision Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 lg:p-6"
                >
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            key={`${sceneData.scene_title}-${sceneData.scene_type}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                        >
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                                {sceneData.scene_title}
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                                {sceneData.scene_description}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Decision Cards Section */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4"
                >
                    <div className="container mx-auto">
                        {/* Multiplayer Vote Status Banner */}
                        {isMultiplayer && voteStatus && voteStatus.status === 'voting' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            {hasVoted 
                                                ? `Waiting for ${voteStatus.participants_pending.length} more team member(s) to vote...`
                                                : 'Please cast your vote'}
                                        </p>
                                        {voteStatus.participants_pending.length > 0 && (
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Pending: {voteStatus.participants_pending.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {isMultiplayer && voteStatus && voteStatus.status === 'resolved' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                        Team decision: <span className="font-bold">
                                            {sceneData?.choices.find(c => c.key === voteStatus.resolved_decision)?.label || voteStatus.resolved_decision}
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {sceneData.choices.map((choice, index) => {
                                const isSelected = selectedDecision === choice.key;
                                // For multiplayer: disable if voted or if vote is resolved
                                // For single-player: disable if decision selected or submitting
                                const isDisabled = isMultiplayer 
                                    ? (hasVoted || voteStatus?.status === 'resolved' || isSubmittingVote)
                                    : (selectedDecision !== null || isSubmitting);
                                
                                // Show vote count for multiplayer
                                const voteCount = isMultiplayer && voteStatus ? (voteStatus.votes[choice.key] || 0) : 0;

                                return (
                                    <motion.div
                                        key={choice.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                    >
                                        <button
                                            onClick={() => handleDecisionSelect(choice.key)}
                                            disabled={isDisabled}
                                            className={cn(
                                                'w-full p-5 rounded-xl border-2 text-left transition-all duration-300',
                                                'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
                                                isSelected
                                                    ? 'bg-blue-500 border-blue-400 text-white shadow-xl ring-4 ring-blue-500/30'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg',
                                                isDisabled && 'opacity-50 cursor-not-allowed'
                                            )}
                                        >
                                            <div className="space-y-2">
                                                {((isSubmitting && isSelected) || (isSubmittingVote && isSelected)) ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <h4 className="font-semibold text-base">
                                                            {isMultiplayer ? 'Submitting vote...' : 'Processing...'}
                                                        </h4>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-semibold text-base">{choice.label}</h4>
                                                        {isMultiplayer && voteCount > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                                                <Users className="w-3 h-3" />
                                                                <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                                                            </div>
                                                        )}
                                                        {isMultiplayer && hasVoted && isSelected && (
                                                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Your vote</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex justify-center gap-4 pb-4">
                            <Button
                                variant="outline"
                                onClick={handlePause}
                                className="flex items-center gap-2"
                            >
                                <Pause className="w-4 h-4" />
                                Pause Simulation
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExit}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Exit Simulation
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Event Feedback Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-4 right-4 z-50 pointer-events-none"
                    >
                        <Card
                            variant="elevated"
                            className={cn(
                                'min-w-[300px] max-w-[90vw] shadow-2xl',
                                toast.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                    : toast.type === 'info'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                            )}
                        >
                            <CardContent className="p-4 flex items-center gap-3">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : toast.type === 'info' ? (
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                )}
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        toast.type === 'success'
                                            ? 'text-green-800 dark:text-green-200'
                                            : toast.type === 'info'
                                            ? 'text-blue-800 dark:text-blue-200'
                                            : 'text-yellow-800 dark:text-yellow-200'
                                    )}
                                >
                                    {toast.message}
                                </span>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pause Modal */}
            <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
                <DialogHeader>
                    <DialogTitle>Simulation Paused</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            The simulation is paused. You can resume when ready.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowPauseModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleResume}>Resume</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Exit Confirmation Modal */}
            <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
                <DialogHeader>
                    <DialogTitle>Exit Simulation?</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            Are you sure you want to exit? Your progress will be saved.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowExitModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
                                Exit
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SimulationLive;

