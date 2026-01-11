import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
    children: React.ReactNode;  // The component to render if authenticated
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Get authentication status from Redux
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // If not authenticated, redirect to login page
    // Otherwise, render the protected component
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;