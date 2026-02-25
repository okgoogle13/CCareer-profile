import React, { useState } from 'react';
import { JobOpportunity } from '../types';
import { extractJobOpportunity } from '../services/geminiService';

interface JobOpportunityExtractorProps {
  onExtracted: (job: JobOpportunity) => void;
}

export const JobOpportunityExtractor: React.FC<JobOpportunityExtractorProps> = ({ onExtracted }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL content');
      }

      const { html } = await response.json();
      const job = await extractJobOpportunity(html, url);
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
        Paste the URL of a job posting to automatically extract its key particulars.
      </p>
      
      <div className="flex gap-4 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/job-posting"
          className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          disabled={isLoading}
        />
        <button
          onClick={handleExtract}
          disabled={!url || isLoading}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Extracting...' : 'Extract'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};
