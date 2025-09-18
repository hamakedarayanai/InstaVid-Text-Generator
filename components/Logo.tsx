
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="InstaVid Text Generator Logo"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A78BFA' }} />
        <stop offset="100%" style={{ stopColor: '#818CF8' }} />
      </linearGradient>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#334155' }} />
        <stop offset="100%" style={{ stopColor: '#1E293B' }} />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="128" fill="url(#bg-gradient)" />
    <path
      d="M363.31,234.58c15.5,8.95,15.5,31.89,0,40.84L211.54,364.5c-15.5,8.95-35.04-2.02-35.04-19.62V165.12c0-17.6,19.54-28.57,35.04-19.62Z"
      fill="url(#logo-gradient)"
    />
    <path d="M128 128 L149.333 106.667 L170.667 128 L149.333 149.333 Z" fill="#A78BFA" />
    <path d="M384 384 L405.333 362.667 L426.667 384 L405.333 405.333 Z" fill="#818CF8" />
    <path
      d="M100 350 L110.667 339.333 L121.333 350 L110.667 360.667 Z"
      fill="#A78BFA"
      opacity="0.7"
    />
  </svg>
);