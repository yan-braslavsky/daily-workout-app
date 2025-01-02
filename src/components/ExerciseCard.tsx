import React, { useState } from "react";
import { Exercise } from "../types/Exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [completed, setCompleted] = useState<boolean>(false);

  return (
    <div className="exercise-card border rounded p-4 shadow bg-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg">
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
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => setCompleted(!completed)}
          className="mr-2"
        />
        Set Complete
      </label>
    </div>
  );
}

export default ExerciseCard;