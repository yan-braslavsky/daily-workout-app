import React, { useState, useCallback } from "react";
import './App.css';
import { generateWorkouts } from "./services/groqService";
import ExerciseCard from "./components/ExerciseCard";
import Footer from "./components/Footer";
import { Exercise } from "./types/Exercise";
import LoadingOverlay from "./components/LoadingOverlay";
import { logger } from "./utils/logger";
import ExpandableHeader from './components/ExpandableHeader';
import WorkoutOptions from './components/WorkoutOptions';
import equipmentData from './equipment.json';

interface WorkoutOptionsState {
  duration: number;
  intensity: string;
  selectedEquipment: { [key: string]: boolean };
  selectedExerciseGroups: { [key: string]: boolean };
}

function App() {
  const [workouts, setWorkouts] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutOptions, setWorkoutOptions] = useState<WorkoutOptionsState | null>(null);
  const equipmentList = equipmentData.equipment;
  const exerciseGroups = ['Legs', 'Shoulders', 'Chest', 'Back', 'Arms', 'Abs'];

  const generatePrompt = (options: WorkoutOptionsState): string => {
    const selectedEquipment = Object.entries(options.selectedEquipment)
      .filter(([_, selected]) => selected)
      .map(([equipment]) => equipment);

    const selectedGroups = Object.entries(options.selectedExerciseGroups)
      .filter(([_, selected]) => selected)
      .map(([group]) => group);

    return `Create a ${options.intensity} intensity workout for ${options.duration} minutes` +
           `${selectedGroups.length ? ` focusing on ${selectedGroups.join(', ')}` : ''}` +
           `${selectedEquipment.length ? ` using ${selectedEquipment.join(', ')}` : ''}`;
  };

  const handleOptionsChange = useCallback((options: WorkoutOptionsState) => {
    setWorkoutOptions(options);
  }, []);

  const handleGenerate = async () => {
    if (!workoutOptions) return;
    
    setError(null);
    try {
      setLoading(true);
      const prompt = generatePrompt(workoutOptions);
      const data = await generateWorkouts(prompt, Object.keys(workoutOptions.selectedEquipment));
      setWorkouts(data.exercises);
    } catch (error: any) {
      logger.error("App error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {loading && <LoadingOverlay />}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <ExpandableHeader onGenerate={handleGenerate}>
        <WorkoutOptions
          equipmentList={equipmentList}
          exerciseGroups={exerciseGroups}
          onOptionsChange={handleOptionsChange}
        />
      </ExpandableHeader>
      <main className="flex-1 p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workouts.map((item, idx) => (
          <ExerciseCard key={idx} exercise={item} />
        ))}
      </main>
      <Footer />
    </div>
  );
}

export default App;
