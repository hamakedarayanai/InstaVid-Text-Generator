
import React, { useRef } from 'react';
import { UploadIcon } from '../constants';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  videoPreviewUrl: string | null;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect, videoPreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className="w-full p-4 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-colors duration-300"
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
      />
      {videoPreviewUrl ? (
        <div className="flex flex-col items-center">
            <video
                src={videoPreviewUrl}
                controls
                className="max-h-64 w-auto rounded-lg shadow-md mb-4"
                />
            <p className="text-indigo-400 font-semibold">Video loaded. Click here to change.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <UploadIcon className="h-12 w-12 text-slate-500 mb-3" />
          <p className="font-semibold text-gray-300">
            <span className="text-indigo-400">Click to upload</span> or drag and drop a video
          </p>
          <p className="text-xs text-slate-400 mt-1">MP4, MOV, WEBM, etc.</p>
        </div>
      )}
    </div>
  );
};
