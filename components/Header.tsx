
import React from 'react';
import { VideoIcon } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="inline-flex items-center justify-center bg-indigo-600/20 text-indigo-400 p-4 rounded-full mb-4">
        <VideoIcon className="w-10 h-10" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
        InstaVid Text Generator
      </h1>
    </header>
  );
};
