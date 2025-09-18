
import React from 'react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="inline-block mb-4">
        <Logo className="w-20 h-20 rounded-3xl shadow-lg" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
        InstaVid Text Generator
      </h1>
    </header>
  );
};