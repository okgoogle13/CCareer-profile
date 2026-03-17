import React from 'react';
import { CareerDatabase } from '../types';

interface QuickFormatProps {
  careerData: CareerDatabase;
}

export const QuickFormat: React.FC<QuickFormatProps> = ({ careerData }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Quick Format</h3>
      <p className="text-gray-400 mb-6">
        Select a visual theme to apply to your base profile.
      </p>
      {/* TODO: Implement theme selection and preview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">Theme 1</div>
        <div className="h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">Theme 2</div>
        <div className="h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">Theme 3</div>
      </div>
    </div>
  );
};
