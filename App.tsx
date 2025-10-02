import React, { useState, useCallback, useEffect } from 'react';
import { generateInstagramContentFromVideo, refineInstagramContent } from './services/geminiService';
import type { InstagramContent } from './types';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { Loader } from './components/Loader';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SparklesIcon, CheckIcon } from './constants';

interface FriendlyError {
  title: string;
  suggestions: string[];
}

const getFriendlyErrorMessage = (error: Error): FriendlyError => {
  const message = error.message.toLowerCase();

  if (message.includes('api_key') || message.includes('permission denied')) {
    return {
      title: "API Configuration Error",
      suggestions: [
        "Please ensure your Google AI API key is correctly configured.",
        "Verify that the key is valid, has not expired, and has billing enabled.",
      ],
    };
  }

  if (message.includes('parse') || message.includes('match the expected format')) {
    return {
      title: "AI Generation Issue",
      suggestions: [
        "The AI had trouble structuring its response. This can be a temporary issue.",
        "Please try generating content for the same video again.",
        "If the problem persists, try a different video.",
      ],
    };
  }
  
  if (message.includes('unsupported') || message.includes('invalid') || message.includes('format')) {
    return {
      title: "Video Processing Failed",
      suggestions: [
        "The video might be in an unsupported format. Try converting it to a common format like MP4.",
        "Ensure the video file is not corrupted or empty.",
        "The video might be too long or too large. Try a shorter or smaller clip.",
      ],
    };
  }

  return {
    title: "An Unexpected Error Occurred",
    suggestions: [
      "Please check your internet connection and try again.",
      "The service might be temporarily unavailable. Please try again in a few moments.",
    ],
  };
};

const Toast: React.FC<{ message: string; show: boolean; onClose: () => void; }> = ({ message, show, onClose }) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (show) {
      setIsHiding(false);
      const timer = setTimeout(() => {
        setIsHiding(true);
        const hideTimer = setTimeout(onClose, 300); // Corresponds to animation duration
        return () => clearTimeout(hideTimer);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show && !isHiding) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 text-white bg-green-600 rounded-full shadow-lg z-50 ${isHiding ? 'toast-anim-out' : 'toast-anim-in'}`}
      role="status"
      aria-live="polite"
    >
      <CheckIcon className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<InstagramContent | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [context, setContext] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleFullReset = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setGeneratedContent(null);
    setError(null);
    setContext('');
    setIsLoading(false);
    setIsRefining(false);
    setIsLoadingUrl(false);
  };
  
  const handleClearForNewUrl = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setGeneratedContent(null);
    setError(null);
  };

  const handleVideoSelect = (file: File) => {
    handleClearForNewUrl();
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };
  
  const handleUrlSubmit = useCallback(async (url: string) => {
    if (!url) return;
    setIsLoadingUrl(true);
    handleClearForNewUrl();
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        const blob = await response.blob();
        if (!blob.type.startsWith('video/')) throw new Error("The provided URL does not point to a valid video file.");
        const fileName = url.substring(url.lastIndexOf('/') + 1) || `video_from_url.${blob.type.split('/')[1] || 'mp4'}`;
        const file = new File([blob], fileName, { type: blob.type });
        handleVideoSelect(file);
    } catch (e: unknown) {
        console.error(e);
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setError({
            title: "Could Not Load Video from URL",
            suggestions: ["Check if the URL is correct and public.", `Details: ${message}`],
        });
    } finally {
        setIsLoadingUrl(false);
    }
  }, []);
  
  const handleError = (e: unknown) => {
    console.error(e);
    if (e instanceof Error) {
      setError(getFriendlyErrorMessage(e));
    } else {
      setError({
        title: "An Unknown Error Occurred",
        suggestions: ["An unexpected issue was encountered. Please try again."],
      });
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!videoFile) return;
    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);
    try {
      const content = await generateInstagramContentFromVideo(videoFile, context);
      setGeneratedContent(content);
    } catch (e: unknown) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  }, [videoFile, context]);

  const handleRefine = useCallback(async (refinementPrompt: string) => {
    if (!videoFile || !generatedContent) return;
    setIsRefining(true);
    setError(null);
    try {
      const content = await refineInstagramContent(videoFile, generatedContent, refinementPrompt);
      setGeneratedContent(content);
    } catch (e: unknown) {
      handleError(e);
    } finally {
      setIsRefining(false);
    }
  }, [videoFile, generatedContent]);

  const showCopyToast = () => {
    setShowToast(true);
  };

  const renderUploader = () => (
    <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700 backdrop-blur-sm animate-fade-in">
      <p className="text-gray-400 mb-6 text-center">
        Upload your video, add some context, and our AI will craft the perfect text for your post.
      </p>
      
      <VideoUploader 
        onVideoSelect={handleVideoSelect} 
        videoPreviewUrl={videoPreview}
        onUrlSubmit={handleUrlSubmit}
        isLoadingUrl={isLoadingUrl}
        onClear={handleClearForNewUrl}
        context={context}
        onContextChange={setContext}
      />

      <div className="mt-8 text-center">
        <button
          onClick={handleGenerate}
          disabled={!videoFile || isLoading}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 transform hover:scale-105 hover:shadow-indigo-500/40"
          style={{minWidth: '220px'}}
        >
          <SparklesIcon />
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-12 animate-fade-in">
        <div className="flex flex-col items-center space-y-4 md:sticky md:top-8 self-start">
            <video
                key={videoPreview}
                src={videoPreview!}
                controls
                className="w-full rounded-lg shadow-2xl"
                aria-label="Video preview"
            />
            <button
                onClick={handleFullReset}
                className="w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-105"
            >
                Start Over
            </button>
        </div>
        <div className="mt-8 md:mt-0">
          <GeneratedContentDisplay 
            content={generatedContent!} 
            onContentChange={setGeneratedContent}
            onRefine={handleRefine}
            isRefining={isRefining}
            onCopy={showCopyToast}
          />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />

        {isLoading ? <Loader /> : (
          <>
            {!generatedContent && renderUploader()}
            {generatedContent && renderResults()}
          </>
        )}
        
        {error && !isLoading && !isRefining && <div className="max-w-4xl mx-auto"><ErrorDisplay error={error} /></div>}
        
      </main>
      <footer className="text-center py-6 text-sm text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
      <Toast message="Copied to clipboard!" show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};

export default App;
