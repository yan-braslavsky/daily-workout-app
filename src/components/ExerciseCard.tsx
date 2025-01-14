import React, { useState, useMemo } from "react";
import { Exercise } from "../types/Exercise";

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate?: (videoUrl: string, thumbnailUrl: string) => void;
}

function ExerciseCard({ exercise, onUpdate }: ExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<boolean[]>(
    new Array(exercise.sets).fill(false)
  );
  const [videoUrl, setVideoUrl] = useState<string>(exercise.videoUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(exercise.thumbnailUrl ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState<string>("");

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : "";
  };

  const handleSaveUrl = () => {
    const newId = extractYouTubeId(tempUrl);
    if (newId) {
      setVideoUrl(tempUrl);
      setThumbnailUrl(`https://img.youtube.com/vi/${newId}/0.jpg`);
      onUpdate?.(tempUrl, `https://img.youtube.com/vi/${newId}/0.jpg`);
    }
    setIsEditing(false);
  };

  const isFullyCompleted = useMemo(
    () => completedSets.every((set) => set),
    [completedSets]
  );

  const handleSetToggle = (index: number) => {
    const newCompletedSets = [...completedSets];
    newCompletedSets[index] = !newCompletedSets[index];
    setCompletedSets(newCompletedSets);
  };

  return (
    <div className={`exercise-card border rounded p-4 shadow bg-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg relative
      ${isFullyCompleted ? 'opacity-90 bg-gray-200' : ''}`}>
      {isFullyCompleted && (
        <div className="absolute inset-0 bg-gray-900/70 z-10 rounded flex items-center justify-center">
          <span className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl font-bold transform rotate-[-5deg] shadow-lg">
            COMPLETED
          </span>
        </div>
      )}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[9/16] relative overflow-hidden mb-2"
      >
        <img
          src={thumbnailUrl}
          alt={exercise.name}
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">
            Watch Short
          </span>
        </div>
      </a>
      <h2 className="text-xl font-bold mb-1">{exercise.name}</h2>
      <p className="text-sm text-gray-700 mb-1">{exercise.description}</p>
      <div className="mt-2">
        <p className="text-sm text-gray-600">Sets: {exercise.sets}</p>
        <p className="text-sm text-gray-600">Reps: {exercise.reps}</p>
        <div className="mt-2">
          {exercise.musclesTargeted.map((muscle, idx) => (
            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">
              {muscle}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {completedSets.map((isCompleted, idx) => (
          <label key={idx} className="flex flex-col items-center justify-center">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => handleSetToggle(idx)}
              className="w-8 h-8 accent-green-600 cursor-pointer"
            />
            <span className="text-sm mt-1">Set {idx + 1}</span>
          </label>
        ))}
      </div>
      <button
        onClick={() => {
          setTempUrl(videoUrl);
          setIsEditing(true);
        }}
        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
      >
        Edit
      </button>
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow">
            <label className="block mb-2">
              New YouTube URL:
              <input
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="w-full border p-1"
              />
            </label>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUrl}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseCard;