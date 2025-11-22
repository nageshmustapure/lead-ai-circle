
import React, { useState, FormEvent } from 'react';

interface AuthModalProps {
    initialView: 'login' | 'register';
    onClose: () => void;
    onRegister: (username: string, email: string, password: string) => Promise<boolean>;
    onLogin: (email: string, password: string) => Promise<boolean>;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose, onRegister, onLogin }) => {
    const [view, setView] = useState(initialView);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (view === 'register') {
            if (!username || !email || !password) {
                setError('All fields are required.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }
            const success = await onRegister(username, email, password);
            if (!success) {
                // Error is handled in alert in App.tsx, but we can set generic error here
                // setError("Registration failed."); 
            }

        } else {
             if (!email || !password) {
                setError('All fields are required.');
                setLoading(false);
                return;
            }
            const success = await onLogin(email, password);
            if (!success) {
                // setError("Invalid credentials.");
            }
        }
        setLoading(false);
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={onClose}
        >
            <div 
                className="card-bg w-full max-w-md p-8 rounded-2xl border border-slate-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-100">
                        {view === 'register' ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'register' && (
                        <div>
                            <label className="block text-slate-400 mb-1" htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                placeholder="Choose a username"
                            />
                        </div>
                    )}
                     <div>
                        <label className="block text-slate-400 mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="you@example.com"
                        />
                    </div>
                     <div>
                        <label className="block text-slate-400 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                        {view === 'register' && <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>}
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : (view === 'register' ? 'Register' : 'Login')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400">
                        {view === 'register' ? 'Already have an account?' : "Don't have an account?"}
                        <button 
                            onClick={() => setView(view === 'register' ? 'login' : 'register')}
                            className="font-semibold text-blue-400 hover:text-blue-300 ml-2"
                        >
                            {view === 'register' ? 'Login' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
