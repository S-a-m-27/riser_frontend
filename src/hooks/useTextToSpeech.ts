import { useState, useRef, useCallback } from 'react';

/**
 * Adds emotional expression to text by:
 * - Adding natural pauses for emphasis
 * - Improving punctuation spacing for better rhythm
 * - Preparing text for more expressive speech
 */
const addEmotionalExpression = (text: string): string => {
    let processed = text;
    
    // Ensure proper spacing after punctuation for natural pauses
    processed = processed.replace(/\.(?!\s)/g, '. '); // Space after periods if not already
    processed = processed.replace(/!(?!\s)/g, '! '); // Space after exclamations
    processed = processed.replace(/\?(?!\s)/g, '? '); // Space after questions
    processed = processed.replace(/,(?!\s)/g, ', '); // Space after commas
    
    // Add slight pauses before important transition words for emphasis
    processed = processed.replace(/\s+(however|but|although|remember|important|note|tip|also|additionally)/gi, '... $1');
    
    // Add emphasis pauses after positive/encouraging phrases
    processed = processed.replace(/(great|excellent|amazing|wonderful|fantastic|awesome|well done|congratulations)([.!?])/gi, '$1$2...');
    
    // Clean up multiple spaces and ellipses
    processed = processed.replace(/\s+/g, ' ');
    processed = processed.replace(/\.{4,}/g, '...'); // Max 3 dots for pauses
    
    return processed.trim();
};

/**
 * Hook for text-to-speech functionality
 * Uses the Web Speech API to read text aloud
 */
export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check if browser supports speech synthesis
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const speak = useCallback((text: string, options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        voice?: SpeechSynthesisVoice;
    }) => {
        if (!isSupported) {
            console.warn('Text-to-speech is not supported in this browser');
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        // Process text to add emotional emphasis and pauses
        const processedText = addEmotionalExpression(text);

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Set default options (child-friendly, expressive voice settings)
        utterance.rate = options?.rate ?? 0.85; // Slightly slower for expressiveness
        utterance.pitch = options?.pitch ?? 1.1; // Slightly higher pitch for friendliness
        utterance.volume = options?.volume ?? 0.85; // Comfortable volume
        utterance.lang = 'en-US';

        // Function to set voice (needed because voices load asynchronously)
        // Prefer expressive, friendly voices
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            
            // Priority order for expressive, emotional voices
            const preferredVoices = voices.filter(voice => {
                const name = voice.name.toLowerCase();
                return (
                    name.includes('samantha') || // macOS - very expressive
                    name.includes('zira') || // Windows - friendly
                    name.includes('karen') || // macOS - expressive
                    name.includes('susan') || // macOS - warm
                    name.includes('google uk english female') || // Chrome - expressive
                    name.includes('google us english female') || // Chrome - friendly
                    name.includes('microsoft zira') || // Windows - emotional
                    (voice.lang.startsWith('en') && 
                     voice.localService && 
                     (name.includes('female') || name.includes('woman')))
                );
            });
            
            if (preferredVoices.length > 0 && !options?.voice) {
                utterance.voice = preferredVoices[0];
                // Adjust pitch slightly higher for more expressiveness
                utterance.pitch = Math.max(1.0, utterance.pitch || 1.1);
            } else if (options?.voice) {
                utterance.voice = options.voice;
            } else if (voices.length > 0) {
                // Fallback to first English female voice for expressiveness
                const englishVoices = voices.filter(v => 
                    v.lang.startsWith('en') && 
                    (v.name.toLowerCase().includes('female') || 
                     v.name.toLowerCase().includes('woman') ||
                     v.name.toLowerCase().includes('samantha') ||
                     v.name.toLowerCase().includes('zira'))
                );
                if (englishVoices.length > 0) {
                    utterance.voice = englishVoices[0];
                } else {
                    // Last resort: any English voice
                    const anyEnglish = voices.filter(v => v.lang.startsWith('en'));
                    if (anyEnglish.length > 0) {
                        utterance.voice = anyEnglish[0];
                    }
                }
            }
        };

        // Set voice immediately if available
        setVoice();

        // Also listen for voices to load (they load asynchronously)
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                setVoice();
                window.speechSynthesis.onvoiceschanged = null; // Remove listener after first load
            };
        }

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const pause = useCallback(() => {
        if (isSupported && isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isSupported, isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if (isSupported && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isSupported, isPaused]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
        }
    }, [isSupported]);

    return {
        speak,
        pause,
        resume,
        stop,
        isSpeaking,
        isPaused,
        isSupported,
    };
};

