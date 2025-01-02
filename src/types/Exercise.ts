export interface Exercise {
  name: string;
  musclesTargeted: string[];
  equipment: string[];
  description: string;
  sets: number;
  reps: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface WorkoutResponse {
  workoutDay: string;
  exercises: Exercise[];
}
