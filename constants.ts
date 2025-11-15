
import React from 'react';
import { FoundingMember, Pillar } from './types';
import { ToolIcon, BreakthroughIcon, TrenchesIcon, QnaIcon } from './components/icons';

export const FOUNDING_MEMBERS: FoundingMember[] = [
    {
        name: "Nagesh Mustapure",
        title: "Data Scientist",
        experience: "6+ years in Data Science",
        company: "Avira Digital",
        imageUrl: "https://picsum.photos/seed/nagesh/128/128"
    },
    {
        name: "Dipak Gudal",
        title: "Data Scientist",
        experience: "4+ years of experience",
        imageUrl: "https://picsum.photos/seed/dipak/128/128"
    },
    {
        name: "Nikhil Avsula",
        title: "Software Engineer",
        experience: "3+ years of experience",
        company: "Avira Digital",
        imageUrl: "https://picsum.photos/seed/nikhil/128/128"
    },
    {
        name: "Aishwarya K.",
        title: "Data Scientist",
        experience: "5+ years of experience",
        imageUrl: "https://picsum.photos/seed/aishwarya/128/128"
    }
];

export const PILLARS: Pillar[] = [
    {
        id: "spotlight",
        title: "AI Tool Spotlight",
        description: "Hands-on demos of cutting-edge AI tools. We stress-test new applications to decide if a tool is hype or a must-have.",
        icon: React.createElement(ToolIcon),
        gridClass: "md:col-span-2 md:row-span-2 flex flex-col justify-center"
    },
    {
        id: "breakthroughs",
        title: "Breakthroughs & Frameworks",
        description: "Decoding foundational changes in the AI landscape—new models, framework updates, and paradigm shifts.",
        icon: React.createElement(BreakthroughIcon),
        gridClass: "md:col-span-2"
    },
    {
        id: "trenches",
        title: "In the Trenches",
        description: "Real problems, proven solutions. Learn from a shared library of battle-tested fixes.",
        icon: React.createElement(TrenchesIcon),
        gridClass: "md:col-span-1"
    },
    {
        id: "qna",
        title: "Mastermind Q&A",
        description: "Unscripted, unfiltered, and unstuck. Get direct feedback from expert perspectives.",
        icon: React.createElement(QnaIcon),
        gridClass: "md:col-span-1"
    }
];
