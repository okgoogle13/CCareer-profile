import React, { useState, useEffect } from 'react';
import { JobOpportunity, CareerDatabase } from '../types';
import { extractJobOpportunity } from '../services/geminiService';
import { useChromeExtension } from '../hooks/useChromeExtension';

interface JobOpportunityExtractorProps {
  onExtracted: (job: JobOpportunity) => void;
  careerData?: CareerDatabase | null;
}

export const JobOpportunityExtractor: React.FC<JobOpportunityExtractorProps> = ({ onExtracted, careerData }) => {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isExtension, currentUrl, extractJobFromPage } = useChromeExtension();

  useEffect(() => {
    if (isExtension && currentUrl) {
      setUrl(currentUrl);
      setInputType('url');
    }
  }, [isExtension, currentUrl]);

  const handleExtractFromPage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pageText = await extractJobFromPage();
      if (pageText) {
        const job = await extractJobOpportunity('text', pageText, careerData || undefined);
        onExtracted(job);
      } else {
        setError("Could not extract text from the current page. Please try pasting the text manually.");
        setInputType('text');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    if (inputType === 'url' && !url) return;
    if (inputType === 'text' && !text) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let contentToProcess = '';
      if (inputType === 'url') {
        contentToProcess = url;
      } else {
        contentToProcess = text;
      }

      const job = await extractJobOpportunity(inputType, contentToProcess, careerData || undefined);
      onExtracted(job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-4">Extract Job Opportunity</h3>
      <p className="text-gray-400 mb-6">
        Paste a URL or the plain text of a job posting to automatically extract its key particulars.
      </p>
      
      {isExtension && (
        <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between">
          <div>
            <h4 className="text-cyan-400 font-bold mb-1">Current Page</h4>
            <p className="text-sm text-gray-400 truncate max-w-md">{currentUrl || 'Loading...'}</p>
          </div>
          <button
            onClick={handleExtractFromPage}
            disabled={isLoading || !currentUrl}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
          >
            {isLoading ? 'Extracting...' : 'Extract from Page'}
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-4 border-b border-gray-700 pb-4">
        <button 
          onClick={() => setInputType('url')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${inputType === 'url' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Paste URL
        </button>
        <button 
          onClick={() => setInputType('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${inputType === 'text' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Paste Text
        </button>
      </div>

      <div className="mb-4">
        {inputType === 'url' ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/job-posting"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 min-h-[200px]"
            disabled={isLoading}
          />
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExtract}
          disabled={(inputType === 'url' && !url) || (inputType === 'text' && !text) || isLoading}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Extracting...' : 'Extract'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
