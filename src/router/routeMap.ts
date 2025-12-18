/**
 * RISER App Route Map
 * Centralized route definitions for consistent navigation
 */

export const ROUTES = {
    // Landing Page
    LANDING: '/',
    
    // Authentication Routes
    AUTH: {
        LOGIN: '/login',
        SIGNUP: '/signup',
        VERIFY_EMAIL: '/verify',
        SELECT_AVATAR: '/avatar',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
    },

    // Settings Routes
    SETTINGS: {
        USER: '/settings',
        PARENTAL_CONTROLS: '/settings/parental-controls',
    },

    // Main App Routes
    DASHBOARD: '/dashboard',

    // Module Routes
    MODULES: {
        FLOOD_INTRO: '/modules/flood-intro',
        FLOOD_NEXT: '/modules/flood/next',
        LESSON_FLOOD: '/lesson/flood',
    },

    // Quiz Routes
    QUIZ: {
        FLOOD: '/quiz/flood',
        FLOOD_RESULT: '/quiz/flood/result',
    },

    // Task Routes
    MISINFO: '/misinfo',
    PUZZLE_FLOOD: '/puzzle/flood',

    // Simulation Routes
    SIMULATION: {
        INTRO: '/simulation/intro',
        TUTORIAL: '/simulation/tutorial',
        START_POINT: '/simulation/flood/start',
        LIVE: '/simulation/live',
        RESULT: '/simulation/result',
        REVIEW: '/simulation/review',
    },

    // Results Routes
    RESULTS: {
        FINAL: '/results/final',
        CERTIFICATE: '/results/certificate',
    },

    // Social Routes
    LEADERBOARD: '/leaderboard',
} as const;

// Helper function to get route path
export const getRoute = (route: string): string => {
    return route;
};

// Navigation helper for type safety
export type RoutePath = typeof ROUTES.LANDING |
    typeof ROUTES[keyof typeof ROUTES] |
    typeof ROUTES.MODULES[keyof typeof ROUTES.MODULES] |
    typeof ROUTES.QUIZ[keyof typeof ROUTES.QUIZ] |
    typeof ROUTES.SIMULATION[keyof typeof ROUTES.SIMULATION] |
    typeof ROUTES.RESULTS[keyof typeof ROUTES.RESULTS] |
    typeof ROUTES.MISINFO |
    typeof ROUTES.PUZZLE_FLOOD |
    typeof ROUTES.LEADERBOARD;




