import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Hook for triggering confetti animations
 * Respects user preference for reduced motion and settings toggle
 */
export const useConfetti = (enabled: boolean = true) => {
    const confettiRef = useRef<typeof confetti | null>(null);

    useEffect(() => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        confettiRef.current = confetti;
    }, []);

    const trigger = (options?: confetti.Options) => {
        if (!enabled || !confettiRef.current) return;

        const defaultOptions: confetti.Options = {
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#FACC15', '#FB923C'], // Kid-friendly colors
            ...options,
        };

        confettiRef.current(defaultOptions);
    };

    const triggerBurst = () => {
        if (!enabled || !confettiRef.current) return;

        // Multiple bursts for celebration effect
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);
            const confettiFn = confettiRef.current;
            if (confettiFn) {
                confettiFn({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                });
                confettiFn({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                });
            }
        }, 250);
    };

    return { trigger, triggerBurst };
};

