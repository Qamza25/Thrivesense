import React, { useState } from 'react';
import { User } from '../../types';
import Login from './Login';
import Signup from './Signup';
import ProfilePicUpload from './ProfilePicUpload';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
  switchMode: (mode: 'login' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLogin, onSignup, switchMode }) => {
    const [signupData, setSignupData] = useState<{username: string, email: string, password: string} | null>(null);
    const [showProfilePicUpload, setShowProfilePicUpload] = useState(false);

    const handleSignupSubmit = (data: {username: string, email: string, password: string}) => {
        setSignupData(data);
        setShowProfilePicUpload(true);
    }

    const handleProfilePicSubmit = (profilePicture?: string) => {
        if (signupData) {
            onSignup({ ...signupData, profilePicture });
        }
    }

    const renderLogo = () => (
        <div className="flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h1 className="ml-3 text-3xl font-bold text-slate-100">Thrivesense</h1>
        </div>
    );
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 transition-all duration-300 ring-1 ring-slate-700">
                {renderLogo()}
                {showProfilePicUpload ? (
                     <ProfilePicUpload onSkip={() => handleProfilePicSubmit()} onSubmit={handleProfilePicSubmit} />
                ) : mode === 'login' ? (
                    <Login onLogin={onLogin} onSwitchToSignup={() => switchMode('signup')} />
                ) : (
                    <Signup onSignup={handleSignupSubmit} onSwitchToLogin={() => switchMode('login')} />
                )}
            </div>
        </div>
    );
};

export default AuthPage;