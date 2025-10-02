import React, { useState, useRef } from 'react';
import { UploadIcon, LinkIcon } from '../constants';

type UploaderMode = 'upload' | 'url';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  videoPreviewUrl: string | null;
  onUrlSubmit: (url: string) => Promise<void>;
  isLoadingUrl: boolean;
  onClear: () => void;
  context: string;
  onContextChange: (context: string) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
    onVideoSelect, 
    videoPreviewUrl, 
    onUrlSubmit, 
    isLoadingUrl,
    onClear,
    context,
    onContextChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<UploaderMode>('upload');
  const [url, setUrl] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onUrlSubmit(url);
  };

  const switchMode = (newMode: UploaderMode) => {
    if (newMode !== mode) {
        setMode(newMode);
        onClear();
        setUrl('');
    }
  };

  const tabButtonClasses = (isActive: boolean) => 
    `flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center justify-center gap-2 ${
        isActive ? 'bg-slate-800/60 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-700/50'
    }`;
  
  return (
    <div className="w-full">
        {/* Tab Controls */}
        <div className="flex border-b border-slate-700">
            <button onClick={() => switchMode('upload')} className={tabButtonClasses(mode === 'upload')}>
                <UploadIcon className="w-5 h-5" />
                Upload File
            </button>
            <button onClick={() => switchMode('url')} className={tabButtonClasses(mode === 'url')}>
                <LinkIcon className="w-5 h-5" />
                Paste URL
            </button>
        </div>

        <div className="pt-6">
            {videoPreviewUrl ? (
                <div className="flex flex-col items-center">
                    <video
                        src={videoPreviewUrl}
                        controls
                        className="max-h-64 w-auto rounded-lg shadow-md mb-4"
                        aria-label="Video preview"
                    />
                </div>
            ) : mode === 'upload' ? (
                <div
                    className="w-full p-4 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-colors duration-300"
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="video/*"
                        className="hidden"
                        aria-label="Video file input"
                    />
                    <div className="flex flex-col items-center justify-center text-center py-10">
                        <UploadIcon className="h-12 w-12 text-slate-500 mb-3" />
                        <p className="font-semibold text-gray-300">
                            <span className="text-indigo-400">Click to upload</span> or drag and drop a video
                        </p>
                        <p className="text-xs text-slate-400 mt-1">MP4, MOV, WEBM, etc.</p>
                    </div>
                </div>
            ) : ( // URL Mode
                <form onSubmit={handleUrlFormSubmit} className="space-y-4 py-8">
                    <label htmlFor="video-url" className="block text-center text-gray-300">Paste a direct link to a video file.</label>
                    <div className="flex items-center gap-2 max-w-lg mx-auto">
                        <input
                            id="video-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoadingUrl || !url}
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isLoadingUrl ? 'Loading...' : 'Load'}
                        </button>
                    </div>
                </form>
            )}
             
            {/* Context Input */}
            <div className="mt-6">
                <label htmlFor="context" className="block text-sm font-medium text-gray-400 mb-2 text-center">
                    Add context (optional)
                </label>
                <textarea
                    id="context"
                    value={context}
                    onChange={(e) => onContextChange(e.target.value)}
                    placeholder="e.g., 'This is a tutorial on how to bake a cake', 'My dog's first time at the beach'"
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
                    aria-label="Optional context for the video"
                />
            </div>
        </div>
    </div>
  );
};