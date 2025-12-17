import { useState, useEffect } from 'react';
import useSoundLib from 'use-sound';

/**
 * Hook for playing sound effects
 * Respects user preference and settings toggle
 * 
 * NOTE: Sound files need to be added to public/sounds/
 * - correct.wav
 * - success.wav
 * 
 * If files don't exist, sounds will fail silently
 */
export const useSound = (enabled: boolean = true) => {
    const [soundsEnabled, setSoundsEnabled] = useState(enabled);
    const [soundError, setSoundError] = useState(false);

    // Load sounds - useSoundLib will handle missing files gracefully
    const [playCorrectFn] = useSoundLib('/sounds/correct.wav', {
        volume: 0.5,
        interrupt: true,
        onloaderror: () => {
            setSoundError(true);
            console.warn('Sound file not found: /sounds/correct.wav');
        },
    });

    const [playSuccessFn] = useSoundLib('/sounds/success.wav', {
        volume: 0.5,
        interrupt: true,
        onloaderror: () => {
            setSoundError(true);
            console.warn('Sound file not found: /sounds/success.wav');
        },
    });

    useEffect(() => {
        setSoundsEnabled(enabled);
    }, [enabled]);

    const playCorrectSound = () => {
        if (soundsEnabled && !soundError) {
            try {
                playCorrectFn();
            } catch (e) {
                // Silently fail if sound can't play
                console.warn('Could not play correct sound:', e);
            }
        }
    };

    const playSuccessSound = () => {
        if (soundsEnabled && !soundError) {
            try {
                playSuccessFn();
            } catch (e) {
                // Silently fail if sound can't play
                console.warn('Could not play success sound:', e);
            }
        }
    };

    return {
        playCorrect: playCorrectSound,
        playSuccess: playSuccessSound,
        setEnabled: setSoundsEnabled,
        enabled: soundsEnabled,
    };
};

