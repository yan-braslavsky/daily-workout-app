
import React, { ChangeEvent } from "react";

interface HeaderProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
}

function Header({ prompt, setPrompt, onGenerate }: HeaderProps) {
  return (
    <header className="flex items-center p-4 bg-gray-900 text-white">
      <input
        type="text"
        placeholder="Enter your workout goals..."
        value={prompt}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
        className="flex-1 mr-2 p-2 rounded text-black"
      />
      <button
        onClick={onGenerate}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
      >
        Generate Workout
      </button>
    </header>
  );
}

export default Header;