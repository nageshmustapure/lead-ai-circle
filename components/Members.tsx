
import React from 'react';
import { FOUNDING_MEMBERS } from '../constants';
import { FoundingMember } from '../types';

const MemberCard: React.FC<{ member: FoundingMember }> = ({ member }) => {
    return (
        <div className="card-bg text-center p-8 rounded-2xl">
            <img 
                src={member.imageUrl} 
                alt={member.name} 
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-700 object-cover" 
            />
            <h4 className="text-xl font-bold text-slate-100">{member.name}</h4>
            <p className="text-blue-400 font-semibold">{member.title}</p>
            <p className="text-slate-400">{member.experience}</p>
            {member.company && <p className="text-slate-500">{member.company}</p>}
        </div>
    );
};

const FoundingMembers: React.FC = () => {
    return (
        <section id="founding-members" className="py-24 relative z-10 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">Meet Our Founding Members</h2>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                        The core group that started the Lead AI initiative.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FOUNDING_MEMBERS.map((member, index) => (
                        <MemberCard key={index} member={member} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FoundingMembers;
