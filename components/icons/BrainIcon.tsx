
import React from 'react';

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5a3.5 3.5 0 0 0-3.5 3.5c0 1.3.4 2.5 1.1 3.5" />
    <path d="M12 5a3.5 3.5 0 0 1 3.5 3.5c0 1.3-.4 2.5-1.1 3.5" />
    <path d="M12 13.5V10" />
    <path d="M17.5 9c1 .6 1.8 1.4 2.3 2.4" />
    <path d="M15.1 6.1c1 .8 1.8 1.8 2.3 3" />
    <path d="M6.5 9c-1 .6-1.8 1.4-2.3 2.4" />
    <path d="M8.9 6.1c-1 .8-1.8 1.8-2.3 3" />
    <path d="M12 21a8 8 0 0 0 8-8c0-1.8-.6-3.5-1.7-4.9" />
    <path d="M12 21a8 8 0 0 1-8-8c0-1.8.6-3.5 1.7-4.9" />
    <path d="M12 21v-3" />
    <path d="M12 13.5a2.5 2.5 0 0 1-2.5-2.5" />
    <path d="M12 13.5a2.5 2.5 0 0 0 2.5-2.5" />
  </svg>
);

export default BrainIcon;
