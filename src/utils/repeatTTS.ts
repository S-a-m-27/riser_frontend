/**
 * Reusable utility for repeated text-to-speech playback
 * Designed for child-friendly repeated listening
 */

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
 * Gets the best available voice for beautiful, engaging, child-friendly speech
 * Prioritizes expressive, warm, and emotionally engaging voices
 */
const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return null;
    }

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
    
    if (tier1Voices.length > 0) {
        // Prefer neural or premium voices if available
        const neuralVoice = tier1Voices.find(v => 
            v.name.toLowerCase().includes('neural') || 
            v.name.toLowerCase().includes('premium') ||
            v.name.toLowerCase().includes('enhanced')
        );
        if (neuralVoice) return neuralVoice;
        return tier1Voices[0];
    }
    
    // Tier 2: Good expressive voices
    const tier2Voices = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        return (
            name.includes('zira') || // Windows - friendly
            name.includes('hazel') || // Windows - warm
            name.includes('aria') || // Windows - expressive
            name.includes('eva') || // Windows - engaging
            name.includes('female') && voice.lang.startsWith('en') && voice.localService
        );
    });
    
    if (tier2Voices.length > 0) {
        return tier2Voices[0];
    }
    
    // Tier 3: Any English female voice (prefer local service for better quality)
    const tier3Voices = voices.filter(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('girl'))
    );
    
    if (tier3Voices.length > 0) {
        // Prefer local service voices (usually better quality)
        const localVoice = tier3Voices.find(v => v.localService);
        if (localVoice) return localVoice;
        return tier3Voices[0];
    }
    
    // Last resort: any English voice
    const anyEnglish = voices.filter(v => v.lang.startsWith('en'));
    return anyEnglish.length > 0 ? anyEnglish[0] : null;
};

/**
 * Plays text-to-speech with repetition
 * 
 * @param text - The text to speak
 * @param repeatCount - Number of times to repeat (clamped between 2 and 3, default: 2)
 * @param delayMs - Delay in milliseconds between repetitions (default: 1200ms)
 * @returns Promise that resolves when all repetitions are complete
 */
export async function playRepeatedTTS(
    text: string,
    repeatCount: number = 2,
    delayMs: number = 1200
): Promise<void> {
    // Check browser support
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Text-to-speech is not supported in this browser');
        return;
    }

    // Cancel any ongoing speech to prevent overlapping voices
    window.speechSynthesis.cancel();

    // Clamp repeatCount between 2 and 3 as per requirements
    const clampedRepeatCount = Math.max(2, Math.min(3, Math.round(repeatCount)));

    // Process text to add emotional emphasis
    const processedText = addEmotionalExpression(text);

    // Get the best available voice
    let voice = getBestVoice();
    
    // If voices haven't loaded yet, wait for them
    if (!voice && window.speechSynthesis.getVoices().length === 0) {
        await new Promise<void>((resolve) => {
            const handler = () => {
                voice = getBestVoice();
                window.speechSynthesis.onvoiceschanged = null;
                resolve();
            };
            window.speechSynthesis.onvoiceschanged = handler;
            // Timeout after 1 second if voices don't load
            setTimeout(() => {
                window.speechSynthesis.onvoiceschanged = null;
                resolve();
            }, 1000);
        });
    }

    // Create utterance with beautiful, engaging, child-friendly settings
    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.rate = 0.85; // Slightly slower for clarity and expressiveness
    utterance.pitch = 1.15; // Higher pitch for warmth and engagement (was 1.1)
    utterance.volume = 1; // Full volume
    utterance.lang = 'en-US';
    
    if (voice) {
        utterance.voice = voice;
    }

    // Helper function to speak and wait for completion
    const speakAndWait = (textToSpeak: string): Promise<void> => {
        return new Promise<void>((resolve) => {
            const currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
            currentUtterance.rate = 0.85; // Engaging rate - clear and expressive
            currentUtterance.pitch = 1.15; // Warm, engaging pitch
            currentUtterance.volume = 1; // Full volume
            currentUtterance.lang = 'en-US';
            if (voice) {
                currentUtterance.voice = voice;
            }

            let resolved = false;

            currentUtterance.onend = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };

            currentUtterance.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };

            // Start speaking
            window.speechSynthesis.speak(currentUtterance);

            // Safety timeout - resolve after 30 seconds to prevent hanging
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    window.speechSynthesis.cancel();
                    resolve();
                }
            }, 30000);
        });
    };

    // Play the utterance multiple times with delays
    for (let i = 0; i < clampedRepeatCount; i++) {
        // Wait for delay before starting next repetition (except first one)
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        // Speak and wait for completion
        await speakAndWait(processedText);
    }
}

/**
 * Check if text-to-speech is supported in the current browser
 */
export function isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Check if speech synthesis is currently speaking
 * Returns true if speech is active, false otherwise
 */
export function isSpeechSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return false;
    }
    return window.speechSynthesis.speaking;
}

/**
 * Stop all ongoing speech synthesis
 * Call this when navigating away from a page or when speech should be cancelled
 */
export function stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

