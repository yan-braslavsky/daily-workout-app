import React, { useRef } from 'react';
import { Exercise } from '../types/Exercise';

interface SaveLoadHeaderProps {
  workouts: Exercise[];
  onLoad: (exercises: Exercise[]) => void;
}

const SaveLoadHeader: React.FC<SaveLoadHeaderProps> = ({ workouts, onLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const fileData = JSON.stringify(workouts, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workout-plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string);
        onLoad(loadedData);
      } catch (error) {
        console.error("Failed to parse workout file:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white shadow p-4 flex justify-center gap-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSave}
      >
        Save
      </button>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLoad}
      >
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default SaveLoadHeader;
