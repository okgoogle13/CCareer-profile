import React, { useState, useEffect } from 'react';
import { JobOpportunity, CareerDatabase } from '../types';
import { extractJobOpportunity } from '../services/geminiService';
import { searchJobs } from '../services/jobSearchService';
import { useChromeExtension } from '../hooks/useChromeExtension';

interface JobOpportunityExtractorProps {
  onExtracted: (job: JobOpportunity) => void;
  careerData?: CareerDatabase | null;
}

export const JobOpportunityExtractor: React.FC<JobOpportunityExtractorProps> = ({ onExtracted, careerData }) => {
  const [inputType, setInputType] = useState<'url' | 'text' | 'search'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string, company: string, url: string, snippet: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [ignoreCriteria, setIgnoreCriteria] = useState(false);
  const { isExtension, currentUrl, extractJobFromPage } = useChromeExtension();

  const validateUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleExtractFromPage = async () => {
    if (!currentUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const job = await extractJobFromPage();
      onExtracted(job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract from page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchJobs(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async (contentToProcess?: string) => {
    const finalContent = contentToProcess || (inputType === 'url' ? url : text);
    if (!finalContent) return;
    
    setIsLoading(true);
    setError(null);

    if (inputType === 'url') {
      const isValid = await validateUrl(finalContent);
      if (!isValid) {
        setError("The URL is not accessible. Please use the fallback option below.");
        setShowFallback(true);
        setIsLoading(false);
        return;
      }
    }

    try {
      const job = await extractJobOpportunity(inputType === 'search' ? 'url' : inputType, finalContent, careerData || undefined);
      if (ignoreCriteria) {
        job.Required_Hard_Skills = [];
        job.Required_Soft_Skills = [];
        job.Required_Experience = "Not specified";
      }
      onExtracted(job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setShowFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[var(--sys-color-charcoalBackground-steps-1)] rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-4">Extract Job Opportunity</h3>
      <p className="text-[var(--sys-color-worker-ash-base)] mb-6">
        Paste a URL, plain text, or search for a live job posting to automatically extract its key particulars.
      </p>
      
      {isExtension && (
        <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between">
          <div>
            <h4 className="text-cyan-400 font-bold mb-1">Current Page</h4>
            <p className="text-sm text-[var(--sys-color-worker-ash-base)] truncate max-w-md">{currentUrl || 'Loading...'}</p>
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

      <div className="flex flex-col md:flex-row gap-4 mb-4 border-b border-[var(--sys-color-concreteGrey-steps-0)] pb-4 justify-between items-start md:items-center">
        <div className="flex gap-2 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setInputType('url')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${inputType === 'url' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'}`}
          >
            Paste URL
          </button>
          <button 
            onClick={() => setInputType('text')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${inputType === 'text' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'}`}
          >
            Paste Text
          </button>
          <button 
            onClick={() => setInputType('search')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${inputType === 'search' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'}`}
          >
            AI Search
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--sys-color-worker-ash-base)] cursor-pointer whitespace-nowrap">
          <input 
            type="checkbox" 
            checked={ignoreCriteria} 
            onChange={(e) => setIgnoreCriteria(e.target.checked)}
            className="rounded border-[var(--sys-color-concreteGrey-steps-0)] text-cyan-500 focus:ring-cyan-500 bg-[var(--sys-color-charcoalBackground-steps-2)]"
          />
          Ignore Strict Criteria
        </label>
      </div>

      <div className="mb-4 space-y-4">
        {inputType === 'search' && (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., Frontend Developer in New York"
                        className="flex-1 bg-[var(--sys-color-charcoalBackground-base)] border border-[var(--sys-color-concreteGrey-steps-0)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg">Search</button>
                </div>
                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        {searchResults.map((res, i) => (
                            <div key={i} className="p-3 bg-[var(--sys-color-charcoalBackground-steps-2)] rounded-lg cursor-pointer hover:bg-[var(--sys-color-charcoalBackground-steps-3)]" onClick={() => handleExtract(res.url)}>
                                <h5 className="font-bold text-white">{res.title}</h5>
                                <p className="text-sm text-[var(--sys-color-paperWhite-base)]">{res.company}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
        {(inputType === 'url' || (showFallback && inputType !== 'search')) && (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/job-posting"
            className="w-full bg-[var(--sys-color-charcoalBackground-base)] border border-[var(--sys-color-concreteGrey-steps-0)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        )}
        {(inputType === 'text' || (showFallback && inputType !== 'search')) && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="w-full bg-[var(--sys-color-charcoalBackground-base)] border border-[var(--sys-color-concreteGrey-steps-0)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 min-h-[200px]"
            disabled={isLoading}
          />
        )}
      </div>

      {inputType !== 'search' && (
        <div className="flex justify-end">
            <button
            onClick={() => handleExtract()}
            disabled={isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            {isLoading ? 'Extracting...' : 'Extract'}
            </button>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          {error}
        </div>
      )}
      {inputType === 'url' && url && !isLoading && !error && (
        <div className="text-amber-400 text-sm mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <strong>Job Freshness Warning:</strong> Ensure this job posting is still active before dedicating time to tailor your resume.
        </div>
      )}
    </div>
  );
};
