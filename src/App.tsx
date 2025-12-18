import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import SelectAvatar from './pages/auth/SelectAvatar';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import FloodIntro from './pages/modules/FloodIntro';
import FloodLesson from './pages/lesson/FloodLesson';
import FloodQuiz from './pages/quiz/FloodQuiz';
import FloodQuizResult from './pages/quiz/FloodQuizResult';
import MisinformationTask from './pages/misinfo/MisinformationTask';
import FloodPuzzle from './pages/puzzle/FloodPuzzle';
import SimulationIntro from './pages/simulation/SimulationIntro';
import StartPoint from './pages/simulation/StartPoint';
import Tutorial from './pages/simulation/Tutorial';
import SimulationLive from './pages/simulation/SimulationLive';
import SimulationResult from './pages/simulation/SimulationResult';
import ReviewDecisions from './pages/simulation/ReviewDecisions';
import FinalResults from './pages/results/FinalResults';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Certificate from './pages/certificate/Certificate';
import ParentalControls from './pages/settings/ParentalControls';
import UserSettings from './pages/settings/UserSettings';
import HelpBubble from './components/HelpBubble';
import AppLayout from './components/layout/AppLayout';
import { ToastProvider } from './contexts/ToastContext';
import { ROUTES } from './router/routeMap';
import { initSounds } from './utils/sound';

const App: React.FC = () => {
    // Initialize sound system on app load
    useEffect(() => {
        initSounds();
    }, []);

    return (
        <ToastProvider>
            <BrowserRouter>
                {/* Help Bubble - Always visible */}
                <HelpBubble />

                <AppLayout>
                    <Routes>
                <Route path={ROUTES.LANDING} element={<Landing />} />
                <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
                <Route path={ROUTES.AUTH.SIGNUP} element={<Signup />} />
                <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<VerifyEmail />} />
                <Route path={ROUTES.AUTH.SELECT_AVATAR} element={<SelectAvatar />} />
                <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPassword />} />
                <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPassword />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.MODULES.FLOOD_INTRO} element={<FloodIntro />} />
                <Route path={ROUTES.MODULES.LESSON_FLOOD} element={<FloodLesson />} />
                <Route path={ROUTES.QUIZ.FLOOD} element={<FloodQuiz />} />
                <Route path={ROUTES.QUIZ.FLOOD_RESULT} element={<FloodQuizResult />} />
                <Route path={ROUTES.MODULES.FLOOD_NEXT} element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Next Module - Coming Soon</h1></div>} />
                <Route path={ROUTES.MISINFO} element={<MisinformationTask />} />
                <Route path={ROUTES.PUZZLE_FLOOD} element={<FloodPuzzle />} />
                <Route path={ROUTES.SIMULATION.INTRO} element={<SimulationIntro />} />
                <Route path={ROUTES.SIMULATION.TUTORIAL} element={<Tutorial />} />
                <Route path={ROUTES.SIMULATION.START_POINT} element={<StartPoint />} />
                <Route path={ROUTES.SIMULATION.LIVE} element={<SimulationLive />} />
                <Route path={ROUTES.SIMULATION.RESULT} element={<SimulationResult />} />
                <Route path={ROUTES.SIMULATION.REVIEW} element={<ReviewDecisions />} />
                <Route path={ROUTES.RESULTS.FINAL} element={<FinalResults />} />
                <Route path={ROUTES.RESULTS.CERTIFICATE} element={<Certificate />} />
                <Route path={ROUTES.LEADERBOARD} element={<Leaderboard />} />
                <Route path={ROUTES.SETTINGS.USER} element={<UserSettings />} />
                <Route path={ROUTES.SETTINGS.PARENTAL_CONTROLS} element={<ParentalControls />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </ToastProvider>
    );
};

export default App;

