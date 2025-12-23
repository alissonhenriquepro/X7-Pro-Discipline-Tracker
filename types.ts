
export type WorkoutType = "Peito" | "Tríceps" | "Bíceps" | "Pernas" | "Ombro" | "Costas" | "Abdômen" | "Superior" | "Inferior";

export interface SportsEvent {
  id: string;
  title: string;
  time: string;
  location: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface Day {
  id: string;
  dayName: string;
  date: string;
  workoutDone: boolean;
  workoutTypes: WorkoutType[];
  exercises: Exercise[];
  waterIntake: number; // em litros
  events?: SportsEvent[]; // Novo campo opcional para eventos
}

export interface Week {
  weekNumber: number;
  days: Day[];
}

export interface MonthData {
  monthName: string;
  year: number;
  weeks: Week[];
}

export interface UserProfile {
  name: string;
  weeklyGoal: number;
  currentStreak: number;
  bestStreak: number;
  totalWorkouts: number;
  diamonds: number;
  rubies: number;
  medals: number;
  lastActiveDate: string; // ISO string
  answeredQuizIds: number[]; // IDs das perguntas já respondidas
  seenTipIndices: number[]; // Índices das dicas já mostradas
}

export interface AppState {
  user: UserProfile;
  months: MonthData[];
}
