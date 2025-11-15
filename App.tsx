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


const App: React.FC = () => {
    const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: 'login' | 'register' }>({ isOpen: false, view: 'login' });
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [route, setRoute] = useState(window.location.hash);

    useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('leadai_users');
            const storedCurrentUser = localStorage.getItem('leadai_currentUser');
            if (storedUsers) setUsers(JSON.parse(storedUsers));
            if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
        }
    }, []);

    const persistData = useCallback((key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
    }, []);

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const handleRegister = useCallback((username: string, email: string, passwordHash: string): boolean => {
        if (users.some(u => u.email === email || u.username.toLowerCase() === username.toLowerCase())) {
            return false;
        }
        const newUser: User = {
            id: Date.now().toString(),
            username,
            email,
            passwordHash,
            portfolio: {
                tagline: "AI Enthusiast & Lifelong Learner",
                about_me: `Hello, I'm ${username}. I'm new here and excited to learn about AI! You can fill out this portfolio by clicking the 'Edit' button.`,
                profile_image_url: `https://i.pravatar.cc/150?u=${Date.now().toString()}`,
                contact: {
                    email: email,
                    phone: '',
                    location: '',
                    linkedin: '',
                    github: '',
                    website: '',
                },
                skills_list: ['AI', 'Machine Learning', 'Data Analysis'],
                projects: [
                    { title: 'Project One', description: 'Describe your first project here.', link: '', imageUrl: '' },
                    { title: 'Project Two', description: 'Describe your second project here.', link: '', imageUrl: '' },
                    { title: 'Project Three', description: 'Describe your third project here.', link: '', imageUrl: '' },
                ],
                experience_list: ['Add your work experience here, one item per line.'],
                education_list: ['Add your education here, one item per line.'],
            }
        };
        const newUsers = [...users, newUser];
        setUsers(newUsers);
        setCurrentUser(newUser);
        persistData('leadai_users', newUsers);
        persistData('leadai_currentUser', newUser);
        setAuthModal({ isOpen: false, view: 'login' });
        window.location.hash = `#/profile/${newUser.username}`;
        return true;
    }, [users, persistData]);

    const handleLogin = useCallback((email: string, passwordHash: string): boolean => {
        const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
        if (user) {
            setCurrentUser(user);
            persistData('leadai_currentUser', user);
            setAuthModal({ isOpen: false, view: 'login' });
            return true;
        }
        return false;
    }, [users, persistData]);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('leadai_currentUser');
        window.location.hash = '#';
    }, []);

    const handleUpdateUser = useCallback((currentUsername: string, updates: { username?: string; portfolio?: Partial<PortfolioData> }) => {
        // Check for username collision before proceeding
        if (updates.username && updates.username.toLowerCase() !== currentUsername.toLowerCase()) {
            if (users.some(u => u.username.toLowerCase() === updates.username!.toLowerCase())) {
                alert('Username is already taken. Please choose another one.');
                return; // Abort update
            }
        }
    
        let usernameChanged = false;
        let newUsername = '';
    
        const newUsers = users.map(u => {
            if (u.username === currentUsername) {
                const updatedUser = { ...u, portfolio: { ...u.portfolio } };
    
                if (updates.username && updates.username !== currentUsername) {
                    usernameChanged = true;
                    newUsername = updates.username;
                    updatedUser.username = updates.username;
                }
                if (updates.portfolio) {
                    updatedUser.portfolio = { ...u.portfolio, ...updates.portfolio };
                }
    
                if (currentUser?.id === u.id) {
                    setCurrentUser(updatedUser);
                    persistData('leadai_currentUser', updatedUser);
                }
                return updatedUser;
            }
            return u;
        });
    
        setUsers(newUsers);
        persistData('leadai_users', newUsers);
    
        if (usernameChanged) {
            window.location.hash = `#/profile/${newUsername}`;
        }
    
    }, [users, currentUser, persistData]);

    const renderPage = () => {
        const path = route.replace(/^#\/?/, '').split('/');
        const page = path[0] || 'home';
        const param = path[1];

        if (page === 'community') {
            return <CommunityPage users={users} />;
        }
        if (page === 'profile' && param) {
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