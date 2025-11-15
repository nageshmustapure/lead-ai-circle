
import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
    children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ to, children, ...props }) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        // Handle routing links (e.g., #/community, #/profile/user, # for home)
        if (to.startsWith('#/') || to === '#') {
            window.location.hash = to;
        } 
        // Handle smooth-scroll links (e.g., #pillars, #mission)
        else if (to.startsWith('#')) {
            const targetId = to.substring(1);
            const element = document.getElementById(targetId);
            
            // If the element is on the current page, scroll to it.
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                // If the element is not on the current page (e.g., we're on #/community),
                // navigate to the home page first, then scroll.
                window.location.hash = '#';
                
                // A short delay is needed to allow React to re-render the home page
                // before we can find the element to scroll to.
                setTimeout(() => {
                    const homeElement = document.getElementById(targetId);
                    homeElement?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    };

    return (
        <a href={to} onClick={handleClick} {...props}>
            {children}
        </a>
    );
};

export default Link;
