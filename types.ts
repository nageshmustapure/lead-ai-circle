
import React from 'react';

export interface FoundingMember {
    name: string;
    title: string;
    experience: string;
    company?: string;
    imageUrl: string;
}

export interface Pillar {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    gridClass: string;
}

export interface Project {
    title: string;
    description: string;
    link: string;
    imageUrl: string;
}

export interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
}

export interface PortfolioData {
    tagline: string;
    about_me: string;
    profile_image_url: string;
    contact: Contact;
    skills_list: string[];
    projects: Project[];
    experience_list: string[];
    education_list: string[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    portfolio: PortfolioData;
}
