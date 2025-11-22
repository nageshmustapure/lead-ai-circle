
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

    // 1. Fetch Users (Community) and Session on Load
    useEffect(() => {
        const initApp = async () => {
            // Check for active session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
                // If logged in, fetch their specific profile details
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile) {
                    setCurrentUser(hydrateUser(profile));
                }
            }

            // Fetch all community members
            fetchCommunity();
            setLoading(false);
        };

        initApp();

        // Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profile) setCurrentUser(hydrateUser(profile));
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchCommunity = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
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
    
    const handleRegister = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username, // Store username in auth metadata
                    }
                }
            });

            if (authError) {
                console.error("Registration Error:", authError);
                alert(`Registration Failed: ${authError.message}`);
                return false;
            }

            if (authData.user) {
                // Check if we have a session. If no session, email confirmation is likely required.
                if (!authData.session) {
                    alert("Registration successful! Please check your email to confirm your account.");
                    setAuthModal({ isOpen: false, view: 'login' });
                    return true;
                }

                // 2. Prepare Profile Data
                const newPortfolio: PortfolioData = {
                    tagline: "AI Enthusiast & Lifelong Learner",
                    about_me: `Hello, I'm ${username}. I'm new here!`,
                    profile_image_url: `https://i.pravatar.cc/150?u=${authData.user.id}`,
                    contact: { email, phone: '', location: '', linkedin: '', github: '', website: '' },
                    skills_list: ['AI', 'Machine Learning'],
                    projects: [],
                    experience_list: [],
                    education_list: [],
                };

                // 3. Create or Update Profile using Upsert
                // This handles race conditions if a trigger already created the profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({ 
                        id: authData.user.id, 
                        username: username, 
                        email: email, 
                        portfolio: newPortfolio 
                    }, { onConflict: 'id' });

                if (profileError) {
                    console.error("Error saving profile:", profileError);
                    alert(`Account created, but profile setup failed: ${profileError.message}`);
                }

                // Success
                setAuthModal({ isOpen: false, view: 'login' });
                await fetchCommunity(); // Refresh the list
                
                // Navigate to profile
                setTimeout(() => {
                    window.location.hash = `#/profile/${username}`;
                }, 100);
                
                return true;
            }
            return false;
        } catch (e: any) {
            console.error("Unexpected error during registration:", e);
            alert(`An unexpected error occurred: ${e.message || e}`);
            return false;
        }
    }, []);

    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
                return false;
            }

            // CRITICAL: Check if profile exists. If user verified email but profile wasn't created yet, create it now.
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single();

                if (!profile) {
                    // Profile missing - self heal
                    const metaUsername = data.user.user_metadata?.username || email.split('@')[0];
                    const defaultPortfolio: PortfolioData = {
                        tagline: "AI Enthusiast & Lifelong Learner",
                        about_me: `Hello, I'm ${metaUsername}.`,
                        profile_image_url: `https://i.pravatar.cc/150?u=${data.user.id}`,
                        contact: { email: email, phone: '', location: '', linkedin: '', github: '', website: '' },
                        skills_list: [],
                        projects: [],
                        experience_list: [],
                        education_list: [],
                    };

                    const { error: insertError } = await supabase.from('profiles').insert([{
                        id: data.user.id,
                        username: metaUsername,
                        email: email,
                        portfolio: defaultPortfolio
                    }]);
                    
                    if (!insertError) {
                         // Update local state immediately
                        setCurrentUser(hydrateUser({
                             id: data.user.id, 
                             username: metaUsername, 
                             email: email, 
                             portfolio: defaultPortfolio
                        }));
                    }
                }
            }
            
            setAuthModal({ isOpen: false, view: 'login' });
            return true;
        } catch (e: any) {
            console.error("Login Error:", e);
            alert("An unexpected error occurred during login.");
            return false;
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        window.location.hash = '#';
    }, []);

    const handleUpdateUser = useCallback(async (currentUsername: string, updates: { username?: string; portfolio?: Partial<PortfolioData> }) => {
        if (!currentUser) return;

        // Optimistic UI Update
        const updatedProfile = {
            username: updates.username || currentUser.username,
            portfolio: { ...currentUser.portfolio, ...updates.portfolio }
        };

        setCurrentUser(prev => prev ? ({ ...prev, ...updatedProfile }) : null);

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
            alert("Failed to save changes.");
            // Ideally revert state here if failed
        } else {
            fetchCommunity(); // Refresh the main list
            if (updates.username && updates.username !== currentUsername) {
                 window.location.hash = `#/profile/${updates.username}`;
            }
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
        </>
    );
};

export default App;
