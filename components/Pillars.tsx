
import React from 'react';
import { PILLARS } from '../constants';

const Pillars: React.FC = () => {
    return (
        <section id="pillars" className="py-24 relative z-10 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">The Lead AI Advantage</h2>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                        Our sessions are built around four powerful pillars designed to deliver actionable intelligence.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
                    {PILLARS.map((pillar) => (
                        <div key={pillar.id} className={`card-bg p-8 rounded-2xl ${pillar.gridClass}`}>
                            <div className="mb-4">{pillar.icon}</div>
                            <h4 className="text-xl md:text-2xl font-bold mb-3 text-slate-100">{pillar.title}</h4>
                            <p className="text-slate-400 text-sm md:text-base">{pillar.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pillars;
