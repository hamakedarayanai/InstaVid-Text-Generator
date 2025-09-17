
import React from 'react';

const loadingMessages = [
    "Analyzing video frames...",
    "Understanding the context...",
    "Crafting the perfect caption...",
    "Finding trending hashtags...",
    "Almost there, sparking creativity...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-8 text-center p-4">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"></div>
            </div>
            <p className="text-slate-400 transition-opacity duration-500">{message}</p>
        </div>
    );
};
