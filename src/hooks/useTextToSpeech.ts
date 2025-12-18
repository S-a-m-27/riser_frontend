import { useState, useRef, useCallback } from 'react';

/**
 * Adds emotional expression to text by:
 * - Adding natural pauses for emphasis
 * - Improving punctuation spacing for better rhythm
 * - Preparing text for more expressive, engaging speech
 * - Adding emphasis to positive and encouraging words
 */
const addEmotionalExpression = (text: string): string => {
    let processed = text;
    
    // Ensure proper spacing after punctuation for natural pauses
    processed = processed.replace(/\.(?!\s)/g, '. '); // Space after periods if not already
    processed = processed.replace(/!(?!\s)/g, '! '); // Space after exclamations
    processed = processed.replace(/\?(?!\s)/g, '? '); // Space after questions
    processed = processed.replace(/,(?!\s)/g, ', '); // Space after commas
    
    // Add emphasis pauses before important transition words for better engagement
    processed = processed.replace(/\s+(however|but|although|remember|important|note|tip|also|additionally|great|excellent|amazing|wonderful|fantastic|awesome|congratulations|well done|good job|keep going|keep learning|keep practicing)/gi, '... $1');
    
    // Add emphasis pauses after positive/encouraging phrases for warmth
    processed = processed.replace(/(great|excellent|amazing|wonderful|fantastic|awesome|well done|congratulations|good job|brilliant|outstanding|superb|marvelous|incredible|perfect|terrific)([.!?])/gi, '$1$2...');
    
    // Add slight pauses after key learning words for emphasis
    processed = processed.replace(/(remember|important|note|tip|key|essential|crucial|vital)([.!?,])/gi, '$1$2...');
    
    // Add pauses around numbers for clarity
    processed = processed.replace(/(\d+)([.!?,])/g, '$1$2...');
    
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
        
        // Set default options (beautiful, engaging, child-friendly voice settings)
        utterance.rate = options?.rate ?? 0.85; // Slightly slower for clarity and expressiveness
        utterance.pitch = options?.pitch ?? 1.15; // Higher pitch for warmth and engagement
        utterance.volume = options?.volume ?? 1.0; // Full volume for better engagement
        utterance.lang = 'en-US';

        // Function to set voice (needed because voices load asynchronously)
        // Prefer expressive, friendly voices
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            
            // Tier 1: Most expressive and engaging voices (highest priority)
            const tier1Voices = voices.filter(voice => {
                const name = voice.name.toLowerCase();
                return (
                    name.includes('samantha') || // macOS - very expressive, warm
                    name.includes('susan') || // macOS - warm, friendly
                    name.includes('karen') || // macOS - expressive, clear
                    name.includes('victoria') || // macOS - engaging
                    name.includes('allison') || // macOS - expressive
                    name.includes('microsoft zira') || // Windows - emotional, engaging
                    name.includes('microsoft hazel') || // Windows - warm, expressive
                    name.includes('google uk english female') || // Chrome - expressive, engaging
                    name.includes('google us english female') || // Chrome - friendly, warm
                    name.includes('google australian english female') || // Chrome - engaging
                    name.includes('amazon polly') || // AWS Polly - high quality
                    name.includes('neural') || // Neural voices - more natural
                    name.includes('premium') || // Premium voices - better quality
                    (name.includes('enhanced') && name.includes('female'))
                );
            });
            
            if (tier1Voices.length > 0 && !options?.voice) {
                // Prefer neural or premium voices if available
                const neuralVoice = tier1Voices.find(v => 
                    v.name.toLowerCase().includes('neural') || 
                    v.name.toLowerCase().includes('premium') ||
                    v.name.toLowerCase().includes('enhanced')
                );
                utterance.voice = neuralVoice || tier1Voices[0];
                // Adjust pitch for more expressiveness
                utterance.pitch = Math.max(1.1, utterance.pitch || 1.15);
            } else if (options?.voice) {
                utterance.voice = options.voice;
            } else if (voices.length > 0) {
                // Tier 2: Good expressive voices
                const tier2Voices = voices.filter(v => {
                    const name = v.name.toLowerCase();
                    return (
                        name.includes('zira') || 
                        name.includes('hazel') || 
                        name.includes('aria') || 
                        name.includes('eva') ||
                        (name.includes('female') && v.lang.startsWith('en') && v.localService)
                    );
                });
                
                if (tier2Voices.length > 0) {
                    utterance.voice = tier2Voices[0];
                } else {
                    // Tier 3: Any English female voice
                    const englishVoices = voices.filter(v => 
                        v.lang.startsWith('en') && 
                        (v.name.toLowerCase().includes('female') || 
                         v.name.toLowerCase().includes('woman') ||
                         v.name.toLowerCase().includes('girl'))
                    );
                    if (englishVoices.length > 0) {
                        const localVoice = englishVoices.find(v => v.localService);
                        utterance.voice = localVoice || englishVoices[0];
                    } else {
                        // Last resort: any English voice
                        const anyEnglish = voices.filter(v => v.lang.startsWith('en'));
                        if (anyEnglish.length > 0) {
                            utterance.voice = anyEnglish[0];
                        }
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

