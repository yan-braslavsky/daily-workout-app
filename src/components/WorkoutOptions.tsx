import React, { useState, useEffect, useCallback } from 'react';

interface WorkoutOptionsProps {
  equipmentList: string[];
  exerciseGroups: string[];
  onOptionsChange: (options: WorkoutOptionsState) => void;
}

interface WorkoutOptionsState {
  duration: number;
  intensity: string;
  selectedEquipment: { [key: string]: boolean };
  selectedExerciseGroups: { [key: string]: boolean };
}

const WorkoutOptions: React.FC<WorkoutOptionsProps> = ({ equipmentList, exerciseGroups, onOptionsChange }) => {
  // Initialize state with empty objects to prevent undefined values
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: string]: boolean }>({});
  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<{ [key: string]: boolean }>({});
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('easy');

  // Initialize checkboxes only once when component mounts
  useEffect(() => {
    setSelectedEquipment(
      equipmentList.reduce((acc, item) => ({ ...acc, [item]: true }), {})
    );
    setSelectedExerciseGroups(
      exerciseGroups.reduce((acc, group) => ({ ...acc, [group]: true }), {})
    );
  }, []); // Empty dependency array means this runs once on mount

  // Memoize the options change callback
  const handleOptionsUpdate = useCallback(() => {
    if (Object.keys(selectedEquipment).length && Object.keys(selectedExerciseGroups).length) {
      onOptionsChange({
        duration,
        intensity,
        selectedEquipment,
        selectedExerciseGroups,
      });
    }
  }, [duration, intensity, selectedEquipment, selectedExerciseGroups, onOptionsChange]);

  // Only update parent when state is ready
  useEffect(() => {
    handleOptionsUpdate();
  }, [handleOptionsUpdate]);

  const handleCheckboxChange = useCallback((
    stateSetter: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
    key: string
  ) => {
    stateSetter(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }, []);

  return (
    <div>
      <div>
        <label>Duration:</label>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes</option>
          <option value={90}>90 minutes</option>
          <option value={120}>120 minutes</option>
        </select>
      </div>
      <div>
        <label>Intensity:</label>
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div>
        <label>Equipment:</label>
        {equipmentList.map(item => (
          <div key={item}>
            <input
              type="checkbox"
              checked={selectedEquipment[item]}
              onChange={() => handleCheckboxChange(setSelectedEquipment, item)}
            />
            {item}
          </div>
        ))}
      </div>
      <div>
        <label>Exercise Groups:</label>
        {exerciseGroups.map(group => (
          <div key={group}>
            <input
              type="checkbox"
              checked={selectedExerciseGroups[group]}
              onChange={() => handleCheckboxChange(setSelectedExerciseGroups, group)}
            />
            {group}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutOptions;
