// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { JSX } from 'react';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, loading } = useAuth();

    console.log('ProtectedRoute:', { isAuthenticated, loading });

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};