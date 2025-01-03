import React, { useState, useCallback } from 'react';

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
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('easy');
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: string]: boolean }>(() => 
    equipmentList.reduce((acc, item) => ({ ...acc, [item]: true }), {})
  );
  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<{ [key: string]: boolean }>(() => 
    exerciseGroups.reduce((acc, group) => ({ ...acc, [group]: true }), {})
  );

  const handleOptionsUpdate = useCallback(() => {
    onOptionsChange({
      duration,
      intensity,
      selectedEquipment,
      selectedExerciseGroups,
    });
  }, [duration, intensity, selectedEquipment, selectedExerciseGroups, onOptionsChange]);

  // Only update parent when values change
  React.useEffect(() => {
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

  const handleSelectAll = useCallback((stateSetter: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>, items: string[]) => {
    stateSetter(items.reduce((acc, item) => ({ ...acc, [item]: true }), {}));
  }, []);

  const handleDeselectAll = useCallback((stateSetter: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>, items: string[]) => {
    stateSetter(items.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-lg font-medium text-gray-700">Duration:</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-lg font-medium text-gray-700">Intensity:</label>
          <select 
            value={intensity} 
            onChange={(e) => setIntensity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-700">Equipment:</label>
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={() => handleSelectAll(setSelectedEquipment, equipmentList)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Select All
            </button>
            <button 
              onClick={() => handleDeselectAll(setSelectedEquipment, equipmentList)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Deselect All
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {equipmentList.map(item => (
              <div key={item} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedEquipment[item]}
                  onChange={() => handleCheckboxChange(setSelectedEquipment, item)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-600">{item}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-700">Exercise Groups:</label>
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={() => handleSelectAll(setSelectedExerciseGroups, exerciseGroups)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Select All
            </button>
            <button 
              onClick={() => handleDeselectAll(setSelectedExerciseGroups, exerciseGroups)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Deselect All
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {exerciseGroups.map(group => (
              <div key={group} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedExerciseGroups[group]}
                  onChange={() => handleCheckboxChange(setSelectedExerciseGroups, group)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-600">{group}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutOptions;
