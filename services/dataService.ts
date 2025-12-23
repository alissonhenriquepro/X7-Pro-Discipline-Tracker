
import { AppState, Day, Exercise, MonthData, Week, WorkoutType } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'x7pro_local_state_v1';

export const EXERCISE_DEFAULTS: Record<string, { name: string, sets: string, reps: string }[]> = {
  "Peito": [
    { name: 'Supino reto', sets: '3', reps: '10-12' },
    { name: 'Supino inclinado', sets: '3', reps: '10-12' },
    { name: 'Crucifixo', sets: '3', reps: '10-12' }
  ],
  "Tríceps": [
    { name: 'Corda', sets: '3', reps: '10-12' },
    { name: 'Francês', sets: '3', reps: '10-12' },
    { name: 'Testa', sets: '3', reps: '10-12' }
  ],
  "Costas": [
    { name: 'Bent Over', sets: '3', reps: '10-12' },
    { name: 'Remada', sets: '3', reps: '10-12' },
    { name: 'Puxada', sets: '3', reps: '10-12' }
  ],
  "Bíceps": [
    { name: 'Rosca scoot', sets: '3', reps: '10-12' },
    { name: 'Martelo', sets: '3', reps: '10-12' },
    { name: 'Barbell Cull', sets: '3', reps: '10-12' }
  ],
  "Pernas": [
    { name: 'Agachamento hack', sets: '3', reps: '10-12' },
    { name: 'Extensora', sets: '3', reps: '10-12' },
    { name: 'Adutora', sets: '3', reps: '10-12' },
    { name: 'Mesa flexora', sets: '3', reps: '10-12' },
    { name: 'Flexora sentado', sets: '3', reps: '10-12' },
    { name: 'Legs press', sets: '3', reps: '10-12' }
  ],
  "Ombro": [
    { name: 'Crucifixo inverso', sets: '3', reps: '10-12' },
    { name: 'Elevação frontal', sets: '3', reps: '10-12' },
    { name: 'Elevação lateral', sets: '3', reps: '10-12' },
    { name: 'Desenvolvimento', sets: '3', reps: '10-12' }
  ],
  "Superior": [
    { name: 'Supino reto', sets: '3', reps: '10-12' },
    { name: 'Puxada', sets: '3', reps: '10-12' },
    { name: 'Desenvolvimento', sets: '3', reps: '10-12' },
    { name: 'Rosca Direta', sets: '3', reps: '10-12' }
  ],
  "Inferior": [
    { name: 'Agachamento hack', sets: '3', reps: '10-12' },
    { name: 'Legs press', sets: '3', reps: '10-12' },
    { name: 'Extensora', sets: '3', reps: '10-12' },
    { name: 'Flexora sentado', sets: '3', reps: '10-12' }
  ]
};

const getDefaultWorkoutTypes = (dayIndex: number): WorkoutType[] => {
  switch (dayIndex) {
    case 0: return ["Peito", "Tríceps"];
    case 1: return ["Costas", "Bíceps"];
    case 2: return ["Pernas"];
    case 3: return ["Ombro"];
    case 4: return ["Bíceps", "Tríceps"];
    case 5: return ["Inferior"];
    case 6: return ["Superior"];
    default: return [];
  }
};

const getDefaultExercises = (types: WorkoutType[]): Exercise[] => {
  const exercises: Exercise[] = [];
  types.forEach(type => {
    const defaults = EXERCISE_DEFAULTS[type] || [];
    defaults.forEach(def => {
      exercises.push({
        id: `${type}-${def.name}-${Math.random()}`,
        name: def.name,
        sets: def.sets,
        reps: def.reps,
        weight: '0',
        completed: false
      });
    });
  });
  return exercises;
};

export const generateInitialData = (): AppState => {
  const now = new Date();
  const currentMonthName = now.toLocaleString('pt-BR', { month: 'long' });
  const currentYear = now.getFullYear();

  const weeks: Week[] = [];
  let dayCounter = 1;
  
  for (let w = 1; w <= 5; w++) {
    const days: Day[] = DAYS_OF_WEEK.map((d, index) => {
      const types = getDefaultWorkoutTypes(index);
      return {
        id: `day-${w}-${index}`,
        dayName: d,
        date: new Date(currentYear, now.getMonth(), dayCounter++).toISOString(),
        workoutDone: false,
        workoutTypes: types,
        exercises: getDefaultExercises(types),
        waterIntake: 0,
        events: []
      };
    });
    weeks.push({ weekNumber: w, days });
  }

  return {
    user: {
      name: "Atleta",
      weeklyGoal: 5,
      currentStreak: 0,
      bestStreak: 0,
      totalWorkouts: 0,
      diamonds: 0,
      rubies: 0,
      medals: 0,
      lastActiveDate: new Date().toISOString(),
      answeredQuizIds: [],
      seenTipIndices: []
    },
    months: [
      {
        monthName: currentMonthName,
        year: currentYear,
        weeks: weeks
      }
    ]
  };
};

export const loadStateFromSupabase = async (userId: string | null): Promise<AppState> => {
  if (!userId) {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
    const initial = generateInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('app_state')
      .eq('id', userId)
      .single();

    if (error || !data?.app_state) {
      const initialState = generateInitialData();
      await saveStateToSupabase(userId, initialState);
      return initialState;
    }

    let state: AppState = data.app_state;
    const now = new Date();
    state.user.lastActiveDate = now.toISOString();

    return state;
  } catch (e) {
    console.error('Error loading state:', e);
    return generateInitialData();
  }
};

export const saveStateToSupabase = async (userId: string | null, state: AppState) => {
  if (!userId) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return;
  }
  try {
    await supabase
      .from('profiles')
      .upsert({ id: userId, app_state: state, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

export const calculateStreak = (months: MonthData[]): number => {
  const allDaysFlat = months
    .flatMap(m => m.weeks.flatMap(w => w.days))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let consecutiveMissed = 0;

  const historicalDays = allDaysFlat
    .filter(d => new Date(d.date) <= today)
    .reverse();

  for (let i = 0; i < historicalDays.length; i++) {
    const day = historicalDays[i];
    const dayDate = new Date(day.date);
    dayDate.setHours(0,0,0,0);

    if (day.workoutDone) {
      streak++;
      consecutiveMissed = 0;
    } else {
      if (dayDate.getTime() === today.getTime()) continue;
      consecutiveMissed++;
      if (consecutiveMissed >= 2) break;
    }
  }
  return streak;
};
