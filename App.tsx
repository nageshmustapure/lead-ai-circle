
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Mission from './components/Mission';
import Pillars from './components/Pillars';
import FoundingMembers from './components/Members';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Link from './components/Link';
import CommunityPage from './components/CommunityPage';
import PortfolioPage from './components/PortfolioPage';
import { User, PortfolioData } from './types';
import { supabase } from './supabaseClient';

// --- Notification Component ---
const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-lg shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
            type === 'success' ? 'bg-green-900/80 border-green-500 text-green-100' : 'bg-red-900/80 border-red-500 text-red-100'
        }`}>
            <div className="flex items-center gap-3">
                {type === 'success' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                <p className="font-medium">{message}</p>
                <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">&times;</button>
            </div>
        </div>
    );
};

const HomePage: React.FC = () => (
    <>
        <Hero />
        <Mission />
        <Pillars />
        <FoundingMembers />
    </>
);

const NotFoundPage: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center text-center">
        <div>
            <h1 className="text-6xl font-bold hero-gradient-text">404</h1>
            <p className="text-2xl mt-4 text-slate-300">User Not Found</p>
            <Link to="#/community" className="mt-8 inline-block bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-slate-200 transition-transform duration-300 hover:scale-105">
                Back to Community
            </Link>
        </div>
    </div>
);

// Ensures that any user object has all necessary properties
const hydrateUser = (dbUser: any): User => {
    const defaultPortfolio: PortfolioData = {
        tagline: "AI Enthusiast & Lifelong Learner",
        about_me: `Hello, I'm ${dbUser.username}.`,
        profile_image_url: '',
        contact: { email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
        skills_list: [],
        projects: [],
        experience_list: [],
        education_list: [],
    };

    const portfolio = dbUser.portfolio || {};

    const hydratedPortfolio: PortfolioData = {
        ...defaultPortfolio,
        ...portfolio,
        contact: {
            ...defaultPortfolio.contact,
            ...(portfolio.contact || {}),
        },
        skills_list: Array.isArray(portfolio.skills_list) ? portfolio.skills_list : [],
        projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
        experience_list: Array.isArray(portfolio.experience_list) ? portfolio.experience_list : [],
        education_list: Array.isArray(portfolio.education_list) ? portfolio.education_list : [],
        profile_image_url: portfolio.profile_image_url || `https://i.pravatar.cc/150?u=${dbUser.id}`,
    };

    return {
        id: dbUser.id,
        username: dbUser.username || 'Unknown',
        email: dbUser.email || '',
        portfolio: hydratedPortfolio,
    };
};


const App: React.FC = () => {
    const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: 'login' | 'register' }>({ isOpen: false, view: 'login' });
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [route, setRoute] = useState(window.location.hash);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };

    // 1. Fetch Users (Community) and Initialize Custom Session
    useEffect(() => {
        const initApp = async () => {
            // Restore session from localStorage since we are using custom auth
            const storedUserStr = localStorage.getItem('lead_ai_user');
            if (storedUserStr) {
                try {
                    const storedUser = JSON.parse(storedUserStr);
                    // Optional: Verify if user still exists in DB
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, username, email, portfolio')
                        .eq('id', storedUser.id)
                        .single();
                    
                    if (data) {
                        setCurrentUser(hydrateUser(data));
                    } else {
                        // User was deleted or data is invalid
                        localStorage.removeItem('lead_ai_user');
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                    localStorage.removeItem('lead_ai_user');
                }
            }

            // Fetch all community members
            await fetchCommunity();
            setLoading(false);
        };

        initApp();
    }, []);

    const fetchCommunity = async () => {
        // Select specific fields as requested: username, email, portfolio
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, email, portfolio');
            
        if (error) {
            console.error('Error fetching community:', error.message, error);
        } else if (data) {
            setUsers(data.map(hydrateUser));
        }
    };

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const handleRegister = useCallback(async (username: string, email: string, password: string): Promise<{success: boolean, message?: string}> => {
        try {
            // 1. Check if email already exists in profiles
            const { data: existingUsers } = await supabase
                .from('profiles')
                .select('email')
                .eq('email', email);
                
            if (existingUsers && existingUsers.length > 0) {
                return { success: false, message: "User already registered. Please login." };
            }

            // 2. Generate ID and Prepare Profile Data
            const newId = crypto.randomUUID();
            
            const newPortfolio: PortfolioData = {
                tagline: "AI Enthusiast & Lifelong Learner",
                about_me: `Hello, I'm ${username}. I'm new here!`,
                profile_image_url: `https://i.pravatar.cc/150?u=${newId}`,
                contact: { email, phone: '', location: '', linkedin: '', github: '', website: '' },
                skills_list: ['AI', 'Machine Learning'],
                projects: [],
                experience_list: [],
                education_list: [],
            };

            // 3. Insert into profiles with 'pass' column
            const { error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                    id: newId, 
                    username: username, 
                    email: email, 
                    pass: password, // Saving password in 'pass' column as requested
                    portfolio: newPortfolio 
                }]);

            if (insertError) {
                console.error("Error creating profile:", insertError);
                return { success: false, message: insertError.message };
            }

            // 4. Auto Login & Persist Session
            const newUser = hydrateUser({ id: newId, username, email, portfolio: newPortfolio });
            setCurrentUser(newUser);
            localStorage.setItem('lead_ai_user', JSON.stringify(newUser));

            setAuthModal({ isOpen: false, view: 'login' });
            showNotification("Registration successful! Welcome aboard.", 'success');
            
            await fetchCommunity();
            
            setTimeout(() => {
                window.location.hash = `#/profile/${username}`;
            }, 100);
            
            return { success: true };
        } catch (e: any) {
            console.error("Unexpected error during registration:", e);
            return { success: false, message: e.message || "Unexpected error occurred" };
        }
    }, []);

    const handleLogin = useCallback(async (email: string, password: string): Promise<{success: boolean, message?: string}> => {
        try {
            // Query profiles directly using 'pass' column
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, email, portfolio')
                .eq('email', email)
                .eq('pass', password);

            if (error) {
                return { success: false, message: error.message };
            }

            // Handle case where user is not found (empty array)
            if (!data || data.length === 0) {
                return { success: false, message: "User not registered. Please check email and password or sign up." };
            }

            // Login successful
            const user = hydrateUser(data[0]);
            setCurrentUser(user);
            localStorage.setItem('lead_ai_user', JSON.stringify(user)); // Persist session
            
            setAuthModal({ isOpen: false, view: 'login' });
            showNotification("Successfully logged in!", 'success');
            return { success: true };
        } catch (e: any) {
            console.error("Login Error:", e);
            return { success: false, message: "An unexpected error occurred." };
        }
    }, []);

    const handleLogout = useCallback(async () => {
        // Clear custom session
        localStorage.removeItem('lead_ai_user');
        setCurrentUser(null);
        window.location.hash = '#';
        showNotification("Logged out successfully", 'success');
    }, []);

    const handleUpdateUser = useCallback(async (currentUsername: string, updates: { username?: string; portfolio?: Partial<PortfolioData> }): Promise<boolean> => {
        if (!currentUser) return false;

        // Optimistic UI Update
        const updatedProfile = {
            username: updates.username || currentUser.username,
            portfolio: { ...currentUser.portfolio, ...updates.portfolio }
        };

        // Send to Supabase
        const { error } = await supabase
            .from('profiles')
            .update({ 
                username: updatedProfile.username, 
                portfolio: updatedProfile.portfolio 
            })
            .eq('id', currentUser.id);

        if (error) {
            console.error("Error updating profile:", error);
            showNotification("Failed to save changes. Please try again.", 'error');
            return false;
        } else {
            const newUserData = { ...currentUser, ...updatedProfile };
            setCurrentUser(newUserData);
            // Update stored session as well
            localStorage.setItem('lead_ai_user', JSON.stringify(newUserData));
            
            showNotification("Profile updated successfully!", 'success');
            
            await fetchCommunity(); // Refresh the main list
            if (updates.username && updates.username !== currentUsername) {
                 window.location.hash = `#/profile/${updates.username}`;
            }
            return true;
        }
    
    }, [currentUser]);

    const renderPage = () => {
        if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading Community...</div>;

        const path = route.replace(/^#\/?/, '').split('/');
        const page = path[0] || 'home';
        const param = path[1];

        if (page === 'community') {
            return <CommunityPage users={users} />;
        }
        if (page === 'profile' && param) {
            // Find user in the loaded users list
            const userToView = users.find(u => u.username.toLowerCase() === param.toLowerCase());
            return userToView ? <PortfolioPage user={userToView} currentUser={currentUser} onUpdate={handleUpdateUser} /> : <NotFoundPage />;
        }
        return <HomePage />;
    };

    return (
        <>
            <div className="glow-effect"></div>
            <Header 
                currentUser={currentUser} 
                onLoginClick={() => setAuthModal({isOpen: true, view: 'login'})}
                onRegisterClick={() => setAuthModal({isOpen: true, view: 'register'})}
                onLogout={handleLogout}
            />
            <main>
                {renderPage()}
            </main>
            <Footer />
            {authModal.isOpen && (
                <AuthModal 
                    initialView={authModal.view}
                    onRegister={handleRegister}
                    onLogin={handleLogin}
                    onClose={() => setAuthModal({isOpen: false, view: 'login'})}
                />
            )}
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
        </>
    );
};

export default App;
