
import React, { useState } from 'react';
import type { InstagramContent } from '../types';
import { CopyIcon, CheckIcon } from '../constants';

interface GeneratedContentDisplayProps {
  content: InstagramContent;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-3 right-3 p-2 rounded-md transition-colors duration-200 ${
        copied ? 'bg-green-600/20 text-green-400' : 'bg-slate-600/50 hover:bg-slate-500/50 text-slate-400 hover:text-slate-200'
      }`}
      aria-label="Copy to clipboard"
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};

const ContentCard: React.FC<{ title: string, children: React.ReactNode, textToCopy: string }> = ({ title, children, textToCopy }) => (
    <div className="relative bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <CopyButton textToCopy={textToCopy} />
        <h3 className="text-lg font-semibold text-indigo-400 mb-3">{title}</h3>
        {children}
    </div>
);


export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ content }) => {
  const { title, caption, hashtags } = content;
  
  // Ensure hashtags start with # for display and copying, and handle cases where AI might include it.
  const formattedHashtags = hashtags.map(tag => `#${tag.replace(/^#/, '')}`);
  const hashtagsString = formattedHashtags.join(' ');

  return (
    <div className="mt-10 space-y-6 animate-fade-in">
        <ContentCard title="Title" textToCopy={title}>
            <p className="text-gray-300 font-medium text-xl">{title}</p>
        </ContentCard>

        <ContentCard title="Caption" textToCopy={caption}>
            <p className="text-gray-300 whitespace-pre-wrap">{caption}</p>
        </ContentCard>

        <ContentCard title="Hashtags" textToCopy={hashtagsString}>
            <div className="flex flex-wrap gap-2">
                {formattedHashtags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        </ContentCard>
    </div>
  );
};
