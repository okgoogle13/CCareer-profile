import { useState, useCallback } from 'react';
import { CareerDatabase } from '../types/api';

interface UseCareerIngestionResult {
  submitDocuments: (files: File[]) => Promise<CareerDatabase>;
  isLoading: boolean;
  error: string | null;
}

export const useCareerIngestion = (): UseCareerIngestionResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitDocuments = useCallback(async (files: File[]): Promise<CareerDatabase> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData to send files to Python/FastAPI backend
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // MOCK API CALL - Replace with your actual backend URL
      // const response = await fetch('/api/v1/ingest', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error(`Ingestion failed: ${response.statusText}`);
      // }
      
      // const data = await response.json();
      
      // SIMULATED DELAY FOR DEVELOPMENT ONLY
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Throw error if no backend is connected yet (Safety mechanism)
      throw new Error("Backend connection not yet implemented. This hook is ready for the '/api/v1/ingest' endpoint.");
      
      // return data as CareerDatabase;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred during ingestion.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    submitDocuments,
    isLoading,
    error,
  };
};
