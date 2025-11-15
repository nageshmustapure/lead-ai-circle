
import React from 'react';
import { User } from '../types';
import Link from './Link';

interface HeaderProps {
    currentUser: User | null;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLoginClick, onRegisterClick, onLogout }) => {
    const navLinks = [
        { href: "#mission", label: "Mission" },
        { href: "#pillars", label: "Pillars" },
        { href: "#founding-members", label: "Founders" },
        { href: "#/community", label: "Community" }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-slate-800">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="#" className="text-2xl font-bold tracking-tighter hero-gradient-text">
                    Lead AI
                </Link>
                <div className="flex items-center gap-8">
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link key={link.href} to={link.href} className="text-slate-300 hover:text-blue-400 transition-colors duration-300">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <>
                                <Link to={`#/profile/${currentUser.username}`} className="text-slate-100 font-semibold hover:text-blue-400 transition-colors">
                                    {currentUser.username}
                                </Link>
                                <button onClick={onLogout} className="bg-slate-700 hover:bg-slate-600 text-sm text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onLoginClick} className="text-slate-300 hover:text-white transition-colors">
                                    Login
                                </button>
                                <button onClick={onRegisterClick} className="bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition-transform duration-300 hover:scale-105">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
