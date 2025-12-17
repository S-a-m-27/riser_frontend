/**
 * Sound utility using Howler.js
 * Provides centralized sound management for the RISER app
 * 
 * Sound files should be placed in: public/sounds/
 * - quiz_success.mp3
 * - quiz_fail.mp3
 * - button_click.mp3
 * - level_up.mp3
 * - achievement.mp3
 */

import { Howl } from 'howler';

// Sound file paths
const SOUND_PATHS = {
    quiz_success: '/sounds/quiz_success.mp3',
    quiz_fail: '/sounds/quiz_fail.mp3',
    button_click: '/sounds/button-click.mp3', // Note: filename uses hyphen, not underscore
    level_up: '/sounds/level_up.mp3',
    achievement: '/sounds/achievement.mp3',
} as const;

// Preloaded sound instances
const sounds: Record<string, Howl | null> = {};

// Initialize sounds (call this once on app load)
export const initSounds = () => {
    // Check if user prefers reduced motion (accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log('🔇 Sounds disabled: user prefers reduced motion');
        return;
    }

    console.log('🔊 Initializing sound system...');

    // Preload all sounds
    Object.entries(SOUND_PATHS).forEach(([key, path]) => {
        try {
            sounds[key] = new Howl({
                src: [path],
                volume: 0.5,
                preload: true,
                onload: () => {
                    console.log(`✅ Sound loaded: ${key}`);
                },
                onloaderror: (_id: number, error: unknown) => {
                    console.warn(`❌ Sound file not found: ${path}`, error);
                    sounds[key] = null;
                },
            });
        } catch (error) {
            console.warn(`❌ Failed to load sound: ${key}`, error);
            sounds[key] = null;
        }
    });

    // Log summary
    const loadedCount = Object.values(sounds).filter(s => s !== null).length;
    const totalCount = Object.keys(SOUND_PATHS).length;
    if (loadedCount === 0) {
        console.warn(`⚠️ No sound files loaded! Please add sound files to public/sounds/ directory.`);
        console.warn(`   Required files: ${Object.values(SOUND_PATHS).join(', ')}`);
    } else {
        console.log(`✅ Sound system initialized: ${loadedCount}/${totalCount} sounds loaded`);
    }
};

// Play sound functions with better error handling
export const playSuccess = () => {
    const sound = sounds.quiz_success || sounds.achievement;
    if (sound) {
        try {
            sound.play();
            console.log('🔊 Playing: success sound');
        } catch (error) {
            console.warn('❌ Failed to play success sound:', error);
        }
    } else {
        console.warn('⚠️ Success sound not available (file missing)');
    }
};

export const playFail = () => {
    const sound = sounds.quiz_fail;
    if (sound) {
        try {
            sound.play();
            console.log('🔊 Playing: fail sound');
        } catch (error) {
            console.warn('❌ Failed to play fail sound:', error);
        }
    } else {
        console.warn('⚠️ Fail sound not available (file missing)');
    }
};

export const playClick = () => {
    const sound = sounds.button_click;
    if (sound) {
        try {
            sound.volume(0.3); // Quieter for frequent clicks
            sound.play();
        } catch (error) {
            // Silently fail for clicks to avoid console spam
        }
    }
};

export const playLevelUp = () => {
    const sound = sounds.level_up;
    if (sound) {
        try {
            sound.play();
            console.log('🔊 Playing: level up sound');
        } catch (error) {
            console.warn('❌ Failed to play level up sound:', error);
        }
    } else {
        console.warn('⚠️ Level up sound not available (file missing)');
    }
};

export const playAchievement = () => {
    const sound = sounds.achievement;
    if (sound) {
        try {
            sound.play();
            console.log('🔊 Playing: achievement sound');
        } catch (error) {
            console.warn('❌ Failed to play achievement sound:', error);
        }
    } else {
        console.warn('⚠️ Achievement sound not available (file missing)');
    }
};

// Set global volume (0.0 to 1.0)
export const setVolume = (volume: number) => {
    Object.values(sounds).forEach((sound) => {
        if (sound) {
            sound.volume(Math.max(0, Math.min(1, volume)));
        }
    });
};

// Check if sounds are enabled
export const areSoundsEnabled = (): boolean => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion && Object.values(sounds).some((s) => s !== null);
};

