
import React from 'react';

const Mission: React.FC = () => {
    return (
        <section id="mission" className="py-20 bg-transparent relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="card-bg p-8 rounded-2xl">
                        <h3 className="text-3xl font-bold mb-4 text-slate-100">Our Mission</h3>
                        <p className="text-slate-300 leading-relaxed">
                            "Our mission is to forge a disciplined circle of AI practitioners who decode the future in real-time. Through a relentless weekly exchange of tactical intelligence and proven solutions, we arm our members with the clarity and advantage needed to master the AI revolution."
                        </p>
                    </div>
                    <div className="card-bg p-8 rounded-2xl">
                        <h3 className="text-3xl font-bold mb-4 text-slate-100">Our Vision</h3>
                        <p className="text-slate-300 leading-relaxed">
                            "To become the definitive engine for AI excellence. Lead AI will be the nexus where top talent, groundbreaking projects, and industry-defining opportunities converge, creating the architects who will command the next era of technological evolution."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Mission;
