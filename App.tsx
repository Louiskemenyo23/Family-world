

import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import StaffPage from './pages/Staff';
import CustomersPage from './pages/Customers';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

// Wrapper for protected routes
const ProtectedRoute: React.FC<React.PropsWithChildren<{ allowedRoles?: string[] }>> = ({ children, allowedRoles }) => {
    const { currentUser, loading } = useStore();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const AppRoutes = () => {
    const { currentUser, logout, settings } = useStore();
    // FIX: Changed NodeJS.Timeout to number for browser compatibility.
    const timerRef = useRef<number | null>(null);

    // --- IDLE TIMER LOGIC ---
    useEffect(() => {
        // If no user is logged in or standby is disabled (0), do nothing
        if (!currentUser || settings.standbyMinutes <= 0) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const logoutUser = () => {
            console.log("Auto-logout triggered due to inactivity");
            logout();
        };

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(logoutUser, settings.standbyMinutes * 60 * 1000);
        };

        // Initialize timer
        resetTimer();

        // Listen for activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [currentUser, settings.standbyMinutes, logout]);

    return (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            {/* Common Routes - Accessible by all authenticated staff */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Restricted Operational Routes */}
            <Route path="/pos" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'WAITER', 'BARTENDER', 'ADMIN']}>
                    <POS />
                </ProtectedRoute>
            } />
            
            <Route path="/kitchen" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'CHEF']}>
                    <Kitchen />
                </ProtectedRoute>
            } />
            
            <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            
            {/* Manager Only Routes */}
            <Route path="/food-menu" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <Menu viewType="food" />
                </ProtectedRoute>
            } />
            <Route path="/bar-menu" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <Menu viewType="bar" />
                </ProtectedRoute>
            } />
            <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <Menu viewType="inventory" />
                </ProtectedRoute>
            } />
            <Route path="/customers" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <CustomersPage />
                </ProtectedRoute>
            } />
            <Route path="/staff" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <StaffPage />
                </ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <Reports />
                </ProtectedRoute>
            } />
             <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <Settings />
                </ProtectedRoute>
            } />
          </Route>
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <AppRoutes />
      </Router>
    </StoreProvider>
  );
};

export default App;