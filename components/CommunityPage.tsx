import React from 'react';
import Link from './Link';
import { User } from '../types';

interface CommunityPageProps {
    users: User[];
}

const CommunityPage: React.FC<CommunityPageProps> = ({ users }) => (
    <section id="community" className="py-24 pt-40 bg-transparent relative z-10 min-h-screen">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">Our Community</h2>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    A growing network of AI practitioners and innovators. Click a profile to see their portfolio.
                </p>
            </div>
            {users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {users.map((user) => (
                        <Link key={user.id} to={`#/profile/${user.username}`} className="block card-bg text-center p-8 rounded-2xl transform hover:-translate-y-1 transition-transform duration-300">
                            <img
                                src={user.portfolio.profile_image_url || `https://i.pravatar.cc/150?u=${user.id}`}
                                alt={user.username}
                                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-700 object-cover"
                            />
                            <h4 className="text-xl font-bold text-slate-100">{user.username}</h4>
                            <p className="text-blue-400 font-semibold">{user.portfolio.tagline}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-slate-400">
                    <p>No members have registered yet. Be the first to join!</p>
                </div>
            )}
        </div>
    </section>
);

export default CommunityPage;
