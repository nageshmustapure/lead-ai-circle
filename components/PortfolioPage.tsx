import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { User, PortfolioData, Project, Contact } from '../types';
import { GithubIcon, LinkedinIcon, WebsiteIcon, EmailIcon, LocationIcon, PhoneIcon, TrashIcon, PlusIcon } from './icons';

interface PortfolioPageProps {
    user: User;
    currentUser: User | null;
    onUpdate: (currentUsername: string, updates: { username?: string; portfolio?: PortfolioData }) => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ user, currentUser, onUpdate }) => {
    const canEdit = currentUser?.id === user.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState<User>(user);
    const [copySuccess, setCopySuccess] = useState('');
    
    const [newSkill, setNewSkill] = useState('');

    const profileImageRef = useRef<HTMLInputElement>(null);
    const projectImageRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setEditUser(JSON.parse(JSON.stringify(user)));
        projectImageRefs.current = user.portfolio.projects.map(() => null);
    }, [user]);

    const handleSave = () => {
        onUpdate(user.username, { username: editUser.username, portfolio: editUser.portfolio });
        setIsEditing(false);
    };

    const handleFileRead = (file: File, callback: (result: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleProfileImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileRead(e.target.files[0], (result) => {
                setEditUser(prev => ({ ...prev, portfolio: {...prev.portfolio, profile_image_url: result }}));
            });
        }
    };
    
    const handlePortfolioChange = (field: keyof Omit<PortfolioData, 'contact' | 'projects' | 'skills_list'>, value: any) => {
        setEditUser(prev => ({ ...prev, portfolio: { ...prev.portfolio, [field]: value } }));
    };
    
    const handleContactChange = (field: keyof Contact, value: string) => {
        setEditUser(prev => ({
            ...prev,
            portfolio: {
                ...prev.portfolio,
                contact: {
                    ...prev.portfolio.contact,
                    [field]: value,
                },
            },
        }));
    };

    const handleProjectImageUpload = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files?.[0]) {
            handleFileRead(e.target.files[0], (result) => {
                const newProjects = [...editUser.portfolio.projects];
                newProjects[index].imageUrl = result;
                setEditUser(prev => ({ ...prev, portfolio: {...prev.portfolio, projects: newProjects }}));
            });
        }
    };

    const handleShare = async () => {
        const profileUrl = `${window.location.origin}${window.location.pathname}#/profile/${user.username}`;
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopySuccess('Link Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };
    
    const handleProjectChange = (index: number, field: keyof Project, value: string) => {
        const newProjects = [...editUser.portfolio.projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setEditUser(prev => ({ ...prev, portfolio: {...prev.portfolio, projects: newProjects }}));
    };

    const handleAddProject = () => {
        setEditUser(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, projects: [...prev.portfolio.projects, { title: '', description: '', link: '', imageUrl: '' }] }
        }));
        projectImageRefs.current.push(null);
    };
    
    const handleRemoveProject = (index: number) => {
        const newProjects = editUser.portfolio.projects.filter((_, i) => i !== index);
        setEditUser(prev => ({ ...prev, portfolio: {...prev.portfolio, projects: newProjects }}));
        projectImageRefs.current.splice(index, 1);
    };

    const handleAddSkill = () => {
        if (newSkill && !editUser.portfolio.skills_list.includes(newSkill)) {
            const newSkills = [...editUser.portfolio.skills_list, newSkill];
            setEditUser(prev => ({...prev, portfolio: {...prev.portfolio, skills_list: newSkills }}));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        const newSkills = editUser.portfolio.skills_list.filter(s => s !== skillToRemove);
        setEditUser(prev => ({...prev, portfolio: {...prev.portfolio, skills_list: newSkills}}));
    };
    
    const renderContactIcon = (key: keyof PortfolioData['contact'], hrefPrefix: string, Icon: React.FC<{className?: string}>) => {
        const value = editUser.portfolio.contact[key];
        if (!value) return null;
        const isEmail = key === 'email';
        const href = isEmail ? `mailto:${value}` : value.startsWith('http') ? value : `${hrefPrefix}${value}`;
        return (
             <a href={href} target="_blank" rel="noopener noreferrer" title={key} className="text-slate-400 hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
            </a>
        );
    }
    
    const renderListAsTextarea = (field: 'experience_list' | 'education_list', placeholder: string) => (
         <textarea 
            value={editUser.portfolio[field].join('\n')} 
            onChange={e => setEditUser(prev => ({...prev, portfolio: {...prev.portfolio, [field]: e.target.value.split('\n')}}))} 
            className="form-textarea w-full bg-slate-900" 
            rows={5} 
            placeholder={placeholder}
        />
    );

    return (
        <div className="pt-24 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-12">
                 <div className="max-w-6xl mx-auto flex justify-end gap-2 mb-6">
                    {canEdit && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary">Edit Portfolio</button>
                    )}
                    {canEdit && isEditing && (
                        <>
                            <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                            <button onClick={() => { setIsEditing(false); setEditUser(JSON.parse(JSON.stringify(user))); }} className="btn btn-secondary">Cancel</button>
                        </>
                    )}
                </div>

                <div className="portfolio-card max-w-6xl mx-auto p-8 md:p-12 lg:p-16 relative z-10">
                    {/* --- HERO SECTION --- */}
                    <section className="grid md:grid-cols-5 gap-12 items-center mb-24">
                        <div className="md:col-span-3 flex flex-col justify-center text-center md:text-left">
                            <p className="text-lg text-slate-300">Hello, I am</p>
                            
                            {isEditing ? (
                                <input type="text" value={editUser.username} onChange={e => setEditUser({...editUser, username: e.target.value})} className="portfolio-hero-name my-2 bg-transparent text-white border-b-2 border-slate-700 focus:border-red-500 outline-none w-full" placeholder="Your Name" />
                            ) : (
                                <h1 className="portfolio-hero-name my-2">{editUser.username}</h1>
                            )}
                            
                            {isEditing ? (
                                <input type="text" value={editUser.portfolio.tagline} onChange={e => handlePortfolioChange('tagline', e.target.value)} className="form-input text-xl max-w-md mx-auto md:mx-0 mt-2 bg-slate-900/80" placeholder="Your Tagline" />
                            ) : (
                                <p className="text-xl text-slate-400 max-w-md mx-auto md:mx-0">{editUser.portfolio.tagline}</p>
                            )}
                            
                            <div className="mt-8">
                                <p className="text-md text-slate-300 mb-4">Find Me on</p>
                                <div className="flex justify-center md:justify-start items-center gap-6">
                                    {renderContactIcon('github', 'https://github.com/', GithubIcon)}
                                    {renderContactIcon('linkedin', 'https://linkedin.com/in/', LinkedinIcon)}
                                    {renderContactIcon('website', '', WebsiteIcon)}
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href={`mailto:${editUser.portfolio.contact.email}`} className="btn btn-primary">Hire Me</a>
                                <div className="relative">
                                     <button onClick={handleShare} className="btn btn-secondary w-full">Share Profile</button>
                                    {copySuccess && <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-sm text-green-400 bg-slate-800 px-2 py-1 rounded shadow-lg whitespace-nowrap">{copySuccess}</span>}
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 relative w-full max-w-xs mx-auto md:max-w-none">
                            <img src={editUser.portfolio.profile_image_url} alt={user.username} className="rounded-2xl w-full h-auto object-cover shadow-2xl aspect-[4/5]" />
                            {isEditing && (
                                <>
                                    <input type="file" ref={profileImageRef} onChange={handleProfileImageUpload} accept="image/*" className="hidden"/>
                                    <button onClick={() => profileImageRef.current?.click()} className="absolute -bottom-3 -right-3 bg-slate-800/80 hover:bg-slate-700/80 p-3 rounded-full text-white transition-colors" aria-label="Upload profile picture">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                    
                    {/* --- ABOUT ME SECTION --- */}
                    <section className="mb-24">
                        <h2 className="section-heading">About Me</h2>
                         {isEditing ? (
                            <textarea value={editUser.portfolio.about_me} onChange={e => handlePortfolioChange('about_me', e.target.value)} className="form-textarea w-full bg-slate-900/80" rows={6} placeholder="Tell everyone a little about yourself..."></textarea>
                        ) : (
                            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">{editUser.portfolio.about_me}</p>
                        )}
                    </section>

                    {/* --- CONTACT INFO (EDIT ONLY) --- */}
                    {isEditing && (
                        <section className="mb-24">
                            <h2 className="section-heading">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 border border-slate-700 rounded-lg">
                                <div>
                                    <label className="block text-slate-400 mb-1 text-sm">Email Address</label>
                                    <input type="email" value={editUser.portfolio.contact.email} onChange={e => handleContactChange('email', e.target.value)} className="form-input" placeholder="you@example.com" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 text-sm">Phone Number</label>
                                    <input type="tel" value={editUser.portfolio.contact.phone} onChange={e => handleContactChange('phone', e.target.value)} className="form-input" placeholder="+1 (555) 123-4567" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 mb-1 text-sm">Location</label>
                                    <input type="text" value={editUser.portfolio.contact.location} onChange={e => handleContactChange('location', e.target.value)} className="form-input" placeholder="City, Country" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 text-sm">GitHub Username</label>
                                    <input type="text" value={editUser.portfolio.contact.github} onChange={e => handleContactChange('github', e.target.value)} className="form-input" placeholder="github-username" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 text-sm">LinkedIn Username</label>
                                    <input type="text" value={editUser.portfolio.contact.linkedin} onChange={e => handleContactChange('linkedin', e.target.value)} className="form-input" placeholder="linkedin-username" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 mb-1 text-sm">Website URL</label>
                                    <input type="url" value={editUser.portfolio.contact.website} onChange={e => handleContactChange('website', e.target.value)} className="form-input" placeholder="https://your-website.com" />
                                </div>
                            </div>
                        </section>
                    )}
                
                    {/* --- SKILLS --- */}
                    <section className="mb-24">
                        <h2 className="section-heading">My Skills</h2>
                         {isEditing ? (
                            <div className="border border-slate-700 p-6 rounded-lg">
                                <div className="flex gap-2 mb-4">
                                    <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} className="form-input flex-grow" placeholder="Add a skill and press Enter"/>
                                    <button onClick={handleAddSkill} className="btn btn-primary !py-2 !px-4"><PlusIcon /></button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {editUser.portfolio.skills_list.map((skill, i) => skill && (
                                        <span key={i} className="bg-slate-700 text-blue-300 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                                            {skill}
                                            <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-white text-xl" aria-label={`Remove ${skill}`}>&times;</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                           <div className="flex flex-wrap gap-3">
                            {editUser.portfolio.skills_list.map((skill, i) => skill && (
                                <span key={i} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full font-semibold">{skill}</span>
                            ))}
                        </div>
                        )}
                    </section>

                    {/* --- PROJECTS --- */}
                    <section className="mb-24">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                             <h2 className="section-heading mt-0 mb-4 sm:mb-0">Latest Projects</h2>
                             {isEditing && (
                                <button onClick={handleAddProject} className="btn btn-primary"><PlusIcon /> Add Project</button>
                             )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {editUser.portfolio.projects.map((project, index) => (
                                <div key={index} className="card-bg rounded-xl overflow-hidden group">
                                    {isEditing ? (
                                        <div className="p-6 space-y-4 relative">
                                            <button onClick={() => handleRemoveProject(index)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors z-10" aria-label={`Remove project ${index+1}`}>
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                            {project.imageUrl && <img src={project.imageUrl} alt="preview" className="mb-2 w-full h-32 object-cover rounded"/>}
                                            <input type="text" value={project.title} onChange={e => handleProjectChange(index, 'title', e.target.value)} className="form-input text-lg font-bold" placeholder={`Project ${index + 1} Title`} />
                                            <textarea value={project.description} onChange={e => handleProjectChange(index, 'description', e.target.value)} className="form-textarea" rows={3} placeholder="Project description..."></textarea>
                                            <input type="url" value={project.link} onChange={e => handleProjectChange(index, 'link', e.target.value)} className="form-input" placeholder="https://project-link.com" />
                                            <div>
                                                <label className="block text-slate-400 mb-1 text-sm">Project Image</label>
                                                <input type="file" ref={el => {projectImageRefs.current[index] = el}} onChange={e => handleProjectImageUpload(e, index)} accept="image/*" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                                            </div>
                                        </div>
                                    ) : (
                                        (project.title || project.description) && (
                                            <>
                                                {project.imageUrl && 
                                                    <div className="aspect-video overflow-hidden">
                                                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                                    </div>
                                                }
                                                <div className="p-6">
                                                    <h4 className="text-xl font-bold text-slate-100">{project.title}</h4>
                                                    <p className="text-slate-400 mt-2 mb-4 h-20 overflow-hidden">{project.description}</p>
                                                    {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-400 hover:underline inline-block">View Project &rarr;</a>}
                                                </div>
                                            </>
                                        )
                                    )}
                                </div>
                            ))}
                             {!isEditing && editUser.portfolio.projects.every(p => !p.title) && (
                                <p className="text-slate-400 text-center py-4 md:col-span-2 lg:col-span-3">No projects added yet.</p>
                            )}
                        </div>
                    </section>
                    
                    {/* --- CAREER & EDUCATION --- */}
                     <section>
                        <h2 className="section-heading">Career & Education</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                             <div className="border border-slate-700/50 p-6 rounded-lg">
                               <h3 className="text-2xl font-bold text-slate-100 mb-4">Career Journey</h3>
                                {isEditing ? renderListAsTextarea('experience_list', 'List experience, one per line') : (
                                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                                        {editUser.portfolio.experience_list.map((item, i) => item && <li key={i}>{item}</li>)}
                                    </ul>
                                )}
                            </div>
                             <div className="border border-slate-700/50 p-6 rounded-lg">
                               <h3 className="text-2xl font-bold text-slate-100 mb-4">Education</h3>
                                {isEditing ? renderListAsTextarea('education_list', 'List education, one per line') : (
                                     <ul className="list-disc list-inside space-y-2 text-slate-300">
                                        {editUser.portfolio.education_list.map((item, i) => item && <li key={i}>{item}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;