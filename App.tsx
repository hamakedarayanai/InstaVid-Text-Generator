import React, { useState, useCallback } from 'react';
import { generateInstagramContentFromVideo } from './services/geminiService';
import type { InstagramContent } from './types';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { Loader } from './components/Loader';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SparklesIcon } from './constants';

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

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<InstagramContent | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);

  const handleClear = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setGeneratedContent(null);
    setError(null);
  };

  const handleVideoSelect = (file: File) => {
    handleClear();
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };
  
  const handleUrlSubmit = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoadingUrl(true);
    handleClear();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('video/')) {
            throw new Error("The provided URL does not point to a valid video file.");
        }
        
        const fileName = url.substring(url.lastIndexOf('/') + 1) || `video_from_url.${blob.type.split('/')[1] || 'mp4'}`;
        const file = new File([blob], fileName, { type: blob.type });

        handleVideoSelect(file);

    } catch (e: unknown) {
        console.error(e);
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setError({
            title: "Could Not Load Video from URL",
            suggestions: [
                "Please check if the URL is correct and publicly accessible.",
                "The server hosting the video might be blocking requests (CORS policy).",
                `Details: ${message}`,
            ],
        });
    } finally {
        setIsLoadingUrl(false);
    }
  }, []);


  const handleGenerateClick = useCallback(async () => {
    if (!videoFile) return;

    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);

    try {
      const content = await generateInstagramContentFromVideo(videoFile);
      setGeneratedContent(content);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(getFriendlyErrorMessage(e));
      } else {
        setError({
          title: "An Unknown Error Occurred",
          suggestions: ["An unexpected issue was encountered. Please try again."],
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [videoFile]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700 backdrop-blur-sm">
          <p className="text-gray-400 mb-6 text-center">
            Upload your video and our AI will craft the perfect title, caption, and hashtags for your Instagram post.
          </p>
          
          <VideoUploader 
            onVideoSelect={handleVideoSelect} 
            videoPreviewUrl={videoPreview}
            onUrlSubmit={handleUrlSubmit}
            isLoadingUrl={isLoadingUrl}
            onClear={handleClear}
          />

          <div className="mt-8 text-center">
            <button
              onClick={handleGenerateClick}
              disabled={!videoFile || isLoading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 transform hover:scale-105"
            >
              <SparklesIcon />
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>

        {error && !isLoading && <ErrorDisplay error={error} />}

        {isLoading && <Loader />}

        {generatedContent && !isLoading && (
          <GeneratedContentDisplay content={generatedContent} />
        )}
      </main>
      <footer className="text-center py-6 text-sm text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;