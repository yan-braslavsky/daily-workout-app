import React, { useState } from "react";
import './App.css';
import { generateWorkouts } from "./services/groqService";
import Header from "./components/Header";
import ExerciseCard from "./components/ExerciseCard";
import Footer from "./components/Footer";
import { Exercise } from "./types/Exercise";
import LoadingOverlay from "./components/LoadingOverlay";
import { logger } from "./utils/logger";

function App() {
  const [prompt, setPrompt] = useState<string>("Create a full body workout focusing on strength and mobility");
  const [workouts, setWorkouts] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await generateWorkouts(prompt, ["Chair", "Yoga Mat"]);
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
      <Header prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerate} />
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
