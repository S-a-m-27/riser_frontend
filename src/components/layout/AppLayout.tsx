import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ROUTES } from '../../router/routeMap';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Hide sidebar on auth pages and simulation live screen
    const hideOnRoutes = [
        ROUTES.LANDING,
        ROUTES.AUTH.LOGIN,
        ROUTES.AUTH.SIGNUP,
        ROUTES.AUTH.VERIFY_EMAIL,
        ROUTES.AUTH.SELECT_AVATAR,
        ROUTES.SIMULATION.LIVE,
    ];

    const showSidebar = !hideOnRoutes.includes(location.pathname as any);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (isMobile) {
            setIsMobileOpen(false);
        }
    }, [location.pathname, isMobile]);

    return (
        <>
            {showSidebar && (
                <Sidebar
                    isMobileOpen={isMobileOpen}
                    onMobileOpen={() => setIsMobileOpen(true)}
                    onMobileClose={() => setIsMobileOpen(false)}
                />
            )}
            <main
                className={cn(
                    'min-h-screen transition-all duration-300',
                    showSidebar && !isMobile && 'ml-[260px]'
                )}
            >
                {children}
            </main>
        </>
    );
};

export default AppLayout;
