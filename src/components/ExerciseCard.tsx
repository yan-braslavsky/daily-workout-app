import React, { useState, useMemo } from "react";
import { Exercise } from "../types/Exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<boolean[]>(
    new Array(exercise.sets).fill(false)
  );

  const isFullyCompleted = useMemo(() => 
    completedSets.every(set => set),
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
        href={exercise.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[9/16] relative overflow-hidden mb-2"
      >
        <img
          src={exercise.thumbnailUrl}
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
    </div>
  );
}

export default ExerciseCard;