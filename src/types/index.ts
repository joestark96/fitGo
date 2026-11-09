export const APP_VERSION = '1.0.4';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  height: number; // in cm
  initialWeight?: number; // in kg
  targetWeight?: number; // in kg
  preferredWeightUnit?: 'kg' | 'lb';
  weekStartDay?: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  createdAt: string;
  updatedAt: string;
}

export type ExerciseMeasurementMode = 'weight_reps' | 'duration' | 'reps_only';

export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'brazos'
  | 'core'
  | 'cardio'
  | 'cuerpo_completo';

export type EquipmentType =
  | 'sin_equipo'
  | 'mancuernas'
  | 'barra'
  | 'maquina'
  | 'polea'
  | 'bandas'
  | 'otro';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultMode: ExerciseMeasurementMode;
  equipment?: EquipmentType;
  description?: string;
  gifUrl?: string;
}

export interface RoutineSetTarget {
  setNumber: number;
  targetReps?: number;
  targetWeightKg?: number;
  targetDurationSeconds?: number;
}

export interface RoutineExerciseConfig {
  id: string;
  exerciseId: string;
  exerciseName: string;
  mode: ExerciseMeasurementMode;
  targetSets: number;
  targetReps?: number;
  targetWeightKg?: number;
  targetDurationSeconds?: number;
  restSeconds?: number;
  notes?: string;
  gifUrl?: string;
  setsConfig?: RoutineSetTarget[];
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  targetDays?: string[]; // e.g. ['Lunes', 'Miércoles', 'Viernes']
  exercises: RoutineExerciseConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSetResult {
  setNumber: number;
  completed: boolean;
  actualReps?: number;
  actualWeightKg?: number;
  actualDurationSeconds?: number;
}

export interface WorkoutExerciseResult {
  exerciseId: string;
  exerciseName: string;
  mode: ExerciseMeasurementMode;
  gifUrl?: string;
  sets: WorkoutSetResult[];
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  date: string; // ISO string
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  exercises: WorkoutExerciseResult[];
  notes?: string;
  isCompleted: boolean;
  caloriesBurned?: number;
  steps?: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  steps?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  bmi: number; // IMC
  // Optional measurements in cm
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
}

export interface BmiCategory {
  category: string;
  rangeText: string;
  color: string;
  description: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  calories: number; // kcal
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  notes?: string;
  createdAt: string;
}

export interface CalorieRecommendation {
  bmr: number; // Tasa Metabólica Basal (kcal)
  tdee: number; // Gasto Energético Total Diario (kcal)
  targetCalories: number; // Meta calórica diaria ajustada por IMC y objetivo
  adjustmentReason: string;
  bmi: number;
  bmiCategory: string;
  deficitOrSurplus: number; // e.g. -400 or +300
}

