
import React from 'react';

const FamilyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
    <path d="M2 7h20" />
    <path d="M12 12v3" />
    <path d="M10 10.5a1.5 1.5 0 1 1 3 0" />
    <path d="M8 8.5a1.5 1.5 0 1 1 3 0" />
    <path d="M13 8.5a1.5 1.5 0 1 1 3 0" />
  </svg>
);

export default FamilyIcon;
