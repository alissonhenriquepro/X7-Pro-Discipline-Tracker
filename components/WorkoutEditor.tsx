
import React, { useState } from 'react';
import { Day, Exercise, WorkoutType } from '../types';
import { EXERCISE_DEFAULTS } from '../services/dataService';
import { RestTimer } from './RestTimer';

interface WorkoutEditorProps {
  day: Day;
  onUpdateDay: (updatedDay: Day) => void;
  onComplete: () => void;
}

const ALL_WORKOUT_TYPES: WorkoutType[] = ["Peito", "Costas", "Pernas", "Ombro", "Bíceps", "Tríceps", "Abdômen", "Superior", "Inferior"];

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ day, onUpdateDay, onComplete }) => {
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', weight: '' });

  const toggleType = (type: WorkoutType) => {
    const isAdding = !day.workoutTypes.includes(type);
    const newTypes = isAdding
      ? [...day.workoutTypes, type]
      : day.workoutTypes.filter(t => t !== type);
    
    let newExercises = [...day.exercises];
    
    if (isAdding) {
      const defaults = EXERCISE_DEFAULTS[type] || [];
      defaults.forEach(def => {
        if (!newExercises.some(ex => ex.name === def.name)) {
          newExercises.push({
            id: `${type}-${def.name}-${Date.now()}-${Math.random()}`,
            name: def.name,
            sets: def.sets,
            reps: def.reps,
            weight: '0',
            completed: false
          });
        }
      });
    } else {
      const defaults = EXERCISE_DEFAULTS[type] || [];
      const defaultNames = defaults.map(d => d.name);
      newExercises = newExercises.filter(ex => !defaultNames.includes(ex.name));
    }

    onUpdateDay({ ...day, workoutTypes: newTypes, exercises: newExercises });
  };

  const addExercise = () => {
    if (!newExercise.name) return;
    const exercise: Exercise = {
      id: Date.now().toString(),
      ...newExercise,
      completed: false
    };
    onUpdateDay({
      ...day,
      exercises: [...day.exercises, exercise]
    });
    setNewExercise({ name: '', sets: '', reps: '', weight: '' });
  };

  const removeExercise = (id: string) => {
    onUpdateDay({
      ...day,
      exercises: day.exercises.filter(e => e.id !== id)
    });
  };

  const toggleExercise = (id: string) => {
    onUpdateDay({
      ...day,
      exercises: day.exercises.map(e => e.id === id ? { ...e, completed: !e.completed } : e)
    });
  };

  return (
    <div className="space-y-6">
      <RestTimer />

      <div className="bg-white rounded-3xl p-6 duo-shadow border-2 border-gray-100 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Treino de {day.dayName}</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Selecione o Foco (Auto-ajuste)</p>
          <div className="flex flex-wrap gap-2">
            {ALL_WORKOUT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-b-2 ${
                  day.workoutTypes.includes(type)
                    ? 'bg-blue-500 border-blue-700 text-white'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano de Exercícios</p>
          {day.exercises.length === 0 && (
            <p className="text-gray-400 text-center py-4 italic text-sm">Nenhum exercício selecionado.</p>
          )}
          {day.exercises.map((ex) => (
            <div key={ex.id} className={`flex items-center justify-between p-3 rounded-2xl border-b-2 transition-colors ${ex.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => toggleExercise(ex.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${ex.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}
                >
                  {ex.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </button>
                <div>
                  <p className={`font-bold text-sm ${ex.completed ? 'text-green-700 line-through opacity-70' : 'text-gray-800'}`}>{ex.name}</p>
                  <p className="text-[10px] text-gray-400">{ex.sets} séries × {ex.reps} reps • {ex.weight}kg</p>
                </div>
              </div>
              {/* Fix: Changed 'id' to 'ex.id' as 'id' was undefined in this scope */}
              <button onClick={() => removeExercise(ex.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border-2 border-dashed border-blue-100 mb-8">
          <p className="text-[10px] font-black text-blue-400 uppercase mb-3">Customizar Exercício</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="col-span-2 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Nome" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
            <input className="bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Séries" value={newExercise.sets} onChange={e => setNewExercise({...newExercise, sets: e.target.value})} />
            <input className="bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Reps" value={newExercise.reps} onChange={e => setNewExercise({...newExercise, reps: e.target.value})} />
            <input className="col-span-2 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Peso (kg)" value={newExercise.weight} onChange={e => setNewExercise({...newExercise, weight: e.target.value})} />
          </div>
          <button onClick={addExercise} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-2 rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-2 transition-all text-xs">ADICIONAR AO TREINO</button>
        </div>

        <button 
          onClick={onComplete}
          className={`w-full font-black py-4 rounded-2xl border-b-4 text-white transition-all duo-button-active flex items-center justify-center space-x-2 ${
            day.workoutDone ? 'bg-gray-300 border-gray-400 cursor-default opacity-60' : 'bg-green-500 hover:bg-green-400 border-green-700'
          }`}
          disabled={day.workoutDone}
        >
          <span>{day.workoutDone ? 'MISSÃO CUMPRIDA!' : 'CONCLUIR TREINO DO DIA'}</span>
        </button>
      </div>
    </div>
  );
};
