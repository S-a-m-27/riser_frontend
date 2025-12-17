/**
 * Kid-friendly microcopy utility
 * Short, friendly strings used across the UI for ages 12-16
 */

export const kidCopy = {
    // Auth & Onboarding
    welcome: "Welcome! Let's get started! 🎉",
    welcomeBack: "Great to see you again! 👋",
    almostThere: "Nice! You're almost there!",
    letsGo: "Ready to continue your journey? Let's go! 🚀",

    // Age Gate
    howOld: "How old are you?",
    selectAge: "Select your age",
    ageRequired: "We need to know your age to keep you safe.",

    // Parental Consent
    parentalConsentTitle: "We need your parent's permission",
    parentalConsentWhy: "If you're under 13, we need your parent or guardian to say it's okay for you to use RISER. This helps keep you safe online!",
    parentalConsentSteps: [
        "Ask your parent or guardian to help you",
        "We'll send them a message to verify",
        "Once they say yes, you can start learning!"
    ],
    imAParent: "I'm a Parent",
    sendConsentRequest: "Send Consent Request",
    consentRequestSent: "Request sent! We'll contact your parent soon.",

    // Buttons & Actions
    continue: "Continue",
    next: "Next",
    back: "Back",
    start: "Start",
    tryAgain: "Try again!",
    youGotThis: "You got this! 💪",
    greatJob: "Great job! 🎉",
    awesome: "Awesome! 🌟",

    // Quiz & Learning
    correct: "Correct! 🎉",
    notQuite: "Not quite, but keep learning!",
    quizComplete: "Quiz complete! Great work!",
    lessonComplete: "Lesson complete! You're doing great!",

    // Gamification
    levelUp: "Level Up! 🚀",
    badgeEarned: "Badge Earned! 🏆",
    achievementUnlocked: "Achievement Unlocked! ⭐",

    // Help & Support
    needHelp: "Need help?",
    helpTitle: "Tips & Help",
    helpDescription: "Here are some tips to help you get started!",

    // Privacy & Safety
    privacyBanner: "If you are under 13, we need your parent's consent. We collect minimal info and don't use ads.",
    learnMorePrivacy: "Learn more about privacy",

    // Errors & Feedback
    somethingWentWrong: "Oops! Something went wrong. Try again!",
    pleaseTryAgain: "Please try again",

    // Settings
    settings: "Settings",
    parentalControls: "Parental Controls",
    reduceMotion: "Reduce Motion",
    enableSounds: "Enable Sounds",
    enableConfetti: "Enable Confetti",

    // Module & Content
    learnMore: "Learn more",
    watchLesson: "Watch lesson",
    takeQuiz: "Take quiz",
    startSimulation: "Start simulation",

    // Completion
    moduleComplete: "Module complete! You're becoming a resilience hero! 🦸",
    certificateReady: "Your certificate is ready! 🎓",
} as const;

export type KidCopyKey = keyof typeof kidCopy;



