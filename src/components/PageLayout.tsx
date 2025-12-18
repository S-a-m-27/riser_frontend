import React from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../router/routeMap';
import { cn } from '../lib/utils';

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * PageLayout wrapper that adds proper spacing for sidebar
 * Only applies spacing on authenticated pages (not on auth/landing pages)
 */
const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
    const location = useLocation();

    // Pages where sidebar is hidden
    const hideSidebarRoutes = [
        ROUTES.LANDING,
        ROUTES.AUTH.LOGIN,
        ROUTES.AUTH.SIGNUP,
        ROUTES.AUTH.VERIFY_EMAIL,
        ROUTES.AUTH.SELECT_AVATAR,
    ];

    const hasSidebar = !hideSidebarRoutes.includes(location.pathname as any);

    return (
        <div
            className={cn(
                'min-h-screen transition-all duration-300',
                hasSidebar && 'md:ml-[80px]',
                // When sidebar is open on desktop (260px), on mobile it's overlay so no margin needed
                className
            )}
        >
            {children}
        </div>
    );
};

export default PageLayout;
