import React from 'react';
import { ExclamationIcon } from '../constants';

interface ErrorDisplayProps {
  error: {
    title: string;
    suggestions: string[];
  };
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-5 py-4 rounded-lg animate-fade-in" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon className="h-5 w-5 text-red-400 mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-md font-medium text-red-200">{error.title}</h3>
          <div className="mt-2 text-sm text-red-300">
            <ul className="list-disc pl-5 space-y-1">
              {error.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};