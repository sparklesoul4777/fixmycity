import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { securityService } from '@/services/securityService';

import { UserRole } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole | UserRole[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Securing Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // Logical Hierarchy: superadmin > admin > officer > citizen
        const roleLevel: Record<string, number> = {
            'citizen': 1,
            'officer': 2,
            'admin': 3,
            'superadmin': 4
        };

        const userLevel = roleLevel[user.role] || 0;
        const requiredLevel = Math.max(...roles.map(r => roleLevel[r] || 0));

        if (userLevel < requiredLevel && !roles.includes(user.role)) {
            securityService.logUnauthorizedAccess(user.id, user.name, location.pathname);
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};
