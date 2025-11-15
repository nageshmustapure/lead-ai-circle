
import React from 'react';
import ThreeAnimation from './ThreeAnimation';
import Link from './Link';

const Hero: React.FC = () => {
    return (
        <section id="home" className="min-h-screen w-full flex items-center pt-24 md:pt-0">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between w-full">
                <div className="md:w-1/2 lg:w-2/5 text-center md:text-left mb-12 md:mb-0 z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-100 mb-4">
                        Master AI
                    </h1>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter hero-gradient-text mb-6">
                        Before AI Masters You
                    </h2>
                    <p className="max-w-xl mx-auto md:mx-0 text-lg md:text-xl text-slate-400 mb-10">
                        Lead AI is an exclusive circle for practitioners dedicated to decoding the future of AI in real-time and gaining a definitive competitive edge.
                    </p>
                    <Link to="#pillars" className="bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-slate-200 transition-transform duration-300 hover:scale-105 inline-block">
                        Discover Our Pillars
                    </Link>
                </div>
                <div className="md:w-1/2 w-full h-[50vh] md:h-auto">
                    <ThreeAnimation />
                </div>
            </div>
        </section>
    );
};

export default Hero;
