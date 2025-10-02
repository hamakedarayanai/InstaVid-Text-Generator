import React, { useState } from 'react';
import type { InstagramContent } from '../types';
import { CopyIcon, CheckIcon, SparklesIcon } from '../constants';

interface GeneratedContentDisplayProps {
  content: InstagramContent;
  onContentChange: (newContent: InstagramContent) => void;
  onRefine: (refinementPrompt: string) => void;
  isRefining: boolean;
  onCopy: () => void;
}

const CopyButton: React.FC<{ onCopy: () => void }> = ({ onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 ${
        copied ? 'bg-green-600/20 text-green-400 scale-110' : 'bg-slate-900/50 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200'
      }`}
      aria-label="Copy to clipboard"
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};

const EditableCard: React.FC<{ 
  title: string, 
  value: string, 
  onChange: (value: string) => void,
  onCopy: () => void,
  isTextarea?: boolean,
  rows?: number,
  placeholder: string
}> = ({ title, value, onChange, onCopy, isTextarea = false, rows = 3, placeholder }) => {
  const InputComponent = isTextarea ? 'textarea' : 'input';
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(value);
    onCopy();
  };
  
  return (
    <div className="relative bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
        <CopyButton onCopy={handleCopyClick} />
        <label htmlFor={title} className="text-lg font-semibold text-indigo-400 mb-3 block">{title}</label>
        <InputComponent
            id={title}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-transparent text-gray-200 placeholder-slate-500 focus:outline-none resize-none text-base"
        />
    </div>
  );
};

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ 
  content, 
  onContentChange, 
  onRefine, 
  isRefining,
  onCopy,
}) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');
  
  const handleCopyAll = () => {
    const formattedHashtags = content.hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ');
    const fullContent = `${content.title}\n\n${content.caption}\n\n${formattedHashtags}`;
    navigator.clipboard.writeText(fullContent);
    onCopy();
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinementPrompt.trim()) {
      onRefine(refinementPrompt);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-4">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-105"
          >
            <CopyIcon className="w-5 h-5" />
            Copy All Content
          </button>
        </div>

        <EditableCard 
          title="Title" 
          value={content.title}
          onChange={(v) => onContentChange({...content, title: v})}
          onCopy={onCopy}
          placeholder="A catchy title..."
        />

        <EditableCard 
          title="Caption" 
          value={content.caption}
          onChange={(v) => onContentChange({...content, caption: v})}
          onCopy={onCopy}
          isTextarea
          rows={5}
          placeholder="An engaging caption..."
        />

        <EditableCard 
          title="Hashtags" 
          value={content.hashtags.join(' ')}
          onChange={(v) => onContentChange({...content, hashtags: v.split(' ').filter(h => h.length > 0)})}
          onCopy={onCopy}
          isTextarea
          rows={3}
          placeholder="#hashtag1 #hashtag2"
        />

        {/* Refine Section */}
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-indigo-400 mb-3 text-center">Refine with AI</h3>
          <form onSubmit={handleRefineSubmit} className="space-y-4">
            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder="e.g., 'Make it funnier', 'Add 3 emojis', 'Target a younger audience'"
              rows={2}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
              aria-label="Refinement instructions"
            />
            <button
              type="submit"
              disabled={isRefining || !refinementPrompt.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 transform hover:scale-105"
            >
              <SparklesIcon />
              {isRefining ? 'Refining...' : 'Refine'}
            </button>
          </form>
        </div>
    </div>
  );
};
