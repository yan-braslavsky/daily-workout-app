import React, { useState, ReactNode } from 'react';

interface ExpandableHeaderProps {
  children: ReactNode;
  onGenerate: () => void;
}

const ExpandableHeader: React.FC<ExpandableHeaderProps> = ({ children, onGenerate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      >
        <h2 className="text-xl font-semibold text-gray-800">Configure workout</h2>
        <div className={`ml-auto transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t border-gray-200">
          {children}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 w-full sm:w-auto"
            >
              Generate Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableHeader;
