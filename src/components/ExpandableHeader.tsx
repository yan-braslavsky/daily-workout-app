import React, { useState, ReactNode } from 'react';

interface ExpandableHeaderProps {
  children: ReactNode;
  onGenerate: () => void;
}

const ExpandableHeader: React.FC<ExpandableHeaderProps> = ({ children, onGenerate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div 
          onClick={toggleExpand} 
          className="flex-1 cursor-pointer"
        >
          <h2 className="text-lg font-semibold">Workout Generation Options</h2>
        </div>
        {!isExpanded && (
          <button
            onClick={onGenerate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate Workout
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableHeader;
