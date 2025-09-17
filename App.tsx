
import React, { useState, useCallback } from 'react';
import { generateInstagramContentFromVideo } from './services/geminiService';
import type { InstagramContent } from './types';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { Loader } from './components/Loader';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { SparklesIcon } from './constants';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<InstagramContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setGeneratedContent(null);
    setError(null);
  };

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
      setError(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
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
          
          <VideoUploader onVideoSelect={handleVideoSelect} videoPreviewUrl={videoPreview} />

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

        {error && (
          <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

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
