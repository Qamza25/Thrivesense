import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import AuthPage from './components/auth/AuthPage';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Check for an active session
    const storedUser = localStorage.getItem('thrivesense_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    // Create a session for the logged-in user
    localStorage.setItem('thrivesense_session', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const handleSignup = useCallback((signedUpUser: User) => {
    // Simulate a user database in localStorage, keyed by email
    const users = JSON.parse(localStorage.getItem('thrivesense_users') || '{}');
    users[signedUpUser.email] = signedUpUser;
    localStorage.setItem('thrivesense_users', JSON.stringify(users));
    
    // Automatically log the new user in by creating a session
    handleLogin(signedUpUser);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    // Only remove the session, not the user account
    localStorage.removeItem('thrivesense_session');
    setUser(null);
    setAuthMode('login');
  }, []);
  
  const switchAuthMode = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage 
            mode={authMode}
            onLogin={handleLogin} 
            onSignup={handleSignup}
            switchMode={switchAuthMode}
        />
      )}
    </div>
  );
};

export default App;