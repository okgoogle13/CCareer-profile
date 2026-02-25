import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';

interface DocumentInputProps {
  onProcess: (files: File[]) => void;
  isLoading: boolean;
}

const MAX_FILES = 100;
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];


export const DocumentInput: React.FC<DocumentInputProps> = ({ onProcess, isLoading }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    setError(null);
    const newFiles = Array.from(incomingFiles).filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File type not supported: ${file.name}. Please use PDF, DOCX, or TXT.`);
        return false;
      }
      return true;
    });

    setFiles(prevFiles => {
      const combined = [...prevFiles, ...newFiles];
      if (combined.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} documents.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0 && !isLoading) {
      onProcess(files);
    }
  };

  return (
    <div className="p-8 bg-gray-800 rounded-lg shadow-xl my-8 mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-300">1. Upload Your Career Documents</h2>
      <p className="text-gray-400 mb-6">
        Upload your career documents (.pdf, .docx, .txt). The AI will process up to 100 documents to de-duplicate and merge the information.
      </p>
      <form onSubmit={handleSubmit}>
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={isLoading}
          />
          <div className="flex flex-col items-center text-gray-400">
            <UploadIcon className="w-12 h-12 mb-4" />
            <p className="font-semibold">Drag & drop files here, or click to select</p>
            <p className="text-sm">Up to {MAX_FILES} documents</p>
          </div>
        </div>
        
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Selected Files:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md animate-fade-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} disabled={isLoading} className="p-1 text-gray-500 hover:text-red-400 disabled:text-gray-700 rounded-full transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || files.length === 0}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? 'Processing...' : `Process ${files.length} File(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};