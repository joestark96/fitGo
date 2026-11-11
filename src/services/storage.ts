import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import {
  UserProfile,
  ExerciseDefinition,
  Routine,
  RoutineExerciseConfig,
  MuscleGroup,
  EquipmentType,
  ExerciseMeasurementMode,
  WeightRecord,
  WorkoutSession,
  BmiCategory,
  FoodEntry,
  ActivityLevel,
  CalorieRecommendation,
  DailyActivity,
  APP_VERSION,
} from '../types';
import { sqliteService } from './sqliteService';

export interface FitTrackBackupPayload {
  appName: 'fitGo!' | 'fitGo' | 'FitTrack';
  version: string;
  exportedAt: string;
  profile: UserProfile | null;
  routines: Routine[];
  customExercises: ExerciseDefinition[];
  weightRecords: WeightRecord[];
  workoutSessions: WorkoutSession[];
  foodEntries: FoodEntry[];
  dailyActivities: DailyActivity[];
  activityLevel: ActivityLevel;
}

export interface RoutinesJsonPackage {
  format: 'fitgo-routines-v1' | 'fittrack-routines-v1';
  version: string;
  exportedAt: string;
  _guia_de_formato?: {
    instrucciones: string;
    grupos_musculares_validos: MuscleGroup[];
    equipos_validos: EquipmentType[];
    modos_de_medicion: Record<ExerciseMeasurementMode, string>;
    dias_validos: string[];
  };
  exercises: Partial<ExerciseDefinition>[];
  routines: Partial<Routine>[];
}

const STORAGE_KEYS = {
  PROFILE: 'fittrack_user_profile',
  EXERCISES: 'fittrack_exercise_catalog',
  ROUTINES: 'fittrack_routines_list',
  WEIGHT_RECORDS: 'fittrack_weight_history',
  WORKOUT_SESSIONS: 'fittrack_workout_history',
  FOOD_ENTRIES: 'fittrack_food_entries',
  ACTIVITY_LEVEL: 'fittrack_user_activity_level',
  ACTIVE_WORKOUT: 'fittrack_active_workout',
  DAILY_ACTIVITIES: 'fittrack_daily_activities',
  LAST_BACKUP_AT: 'fittrack_last_backup_at',
};

export { DEFAULT_EXERCISES };

// Default Sample Routines
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-en-casa-fullbody',
    name: 'Rutina Full Body en Casa (Sin Máquinas)',
    description: 'Entrenamiento completo con peso corporal y calistenia para hacer en casa sin equipo.',
    targetDays: ['Martes', 'Jueves', 'Sábado'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-home-1',
        exerciseId: 'ex-flexiones',
        exerciseName: 'Flexiones de Pecho (Push-ups)',
        mode: 'reps_only',
        targetSets: 4,
        targetReps: 12,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/push-up.gif',
      },
      {
        id: 'r-home-2',
        exerciseId: 'ex-zancadas',
        exerciseName: 'Zancadas / Desplantes (Lunges)',
        mode: 'reps_only',
        targetSets: 4,
        targetReps: 12,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/dumbbell-lunge.gif',
      },
      {
        id: 'r-home-3',
        exerciseId: 'ex-puente-gluteos-elevado',
        exerciseName: 'Puente de Glúteos (Glute Bridge)',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/bodyweight-single-leg-glute-bridge.gif',
      },
      {
        id: 'r-home-4',
        exerciseId: 'ex-fondos-banco-triceps',
        exerciseName: 'Fondos de Tríceps en Silla o Banco',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/bench-dip-on-floor.gif',
      },
      {
        id: 'r-home-5',
        exerciseId: 'ex-escaladores',
        exerciseName: 'Escaladores (Mountain Climbers)',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 20,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/cross-body-mountain-climber.gif',
      },
      {
        id: 'r-home-6',
        exerciseId: 'ex-plancha',
        exerciseName: 'Plancha Abdominal Isométrica (Plank)',
        mode: 'duration',
        targetSets: 3,
        targetDurationSeconds: 45,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/front-plank-with-twist.gif',
      },
      {
        id: 'r-home-7',
        exerciseId: 'ex-bicicleta-abdominal',
        exerciseName: 'Bicicleta Abdominal (Air Bike Crunches)',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 20,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/air-bike.gif',
      },
    ],
  },
  {
    id: 'routine-pecho-triceps',
    name: 'Torso: Pecho y Tríceps',
    description: 'Rutina de fuerza e hipertrofia para empuje.',
    targetDays: ['Lunes', 'Jueves'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-ex-1',
        exerciseId: 'ex-press-banca',
        exerciseName: 'Press de Banca Plano',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 10,
        targetWeightKg: 60,
        restSeconds: 90,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-bench-press.gif',
      },
      {
        id: 'r-ex-2',
        exerciseId: 'ex-aperturas',
        exerciseName: 'Aperturas con Mancuernas',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 14,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-fly.gif',
      },
      {
        id: 'r-ex-3',
        exerciseId: 'ex-flexiones',
        exerciseName: 'Flexiones de Pecho (Push-ups)',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/push-up.gif',
      },
      {
        id: 'r-ex-4',
        exerciseId: 'ex-fondos-triceps',
        exerciseName: 'Fondos en Paralelas (Dips)',
        mode: 'reps_only',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/assisted-chest-dip-kneeling.gif',
      },
      {
        id: 'r-ex-5',
        exerciseId: 'ex-plancha',
        exerciseName: 'Plancha Abdominal (Plank)',
        mode: 'duration',
        targetSets: 3,
        targetDurationSeconds: 45,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/front-plank-with-twist.gif',
      },
    ],
  },
  {
    id: 'routine-pierna-full',
    name: 'Pierna & Core Completo',
    description: 'Enfoque en cuádriceps, glúteos e isquiotibiales.',
    targetDays: ['Martes', 'Viernes'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-ex-10',
        exerciseId: 'ex-sentadilla',
        exerciseName: 'Sentadilla con Barra (Squat)',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 8,
        targetWeightKg: 70,
        restSeconds: 120,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-full-squat.gif',
      },
      {
        id: 'r-ex-11',
        exerciseId: 'ex-prensa-piernas',
        exerciseName: 'Prensa de Piernas',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 100,
        restSeconds: 90,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/barbell-bench-squat.gif',
      },
      {
        id: 'r-ex-12',
        exerciseId: 'ex-zancadas',
        exerciseName: 'Zancadas / Desplantes',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 12,
        restSeconds: 60,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-lunge-with-bicep-curl.gif',
      },
      {
        id: 'r-ex-13',
        exerciseId: 'ex-plancha',
        exerciseName: 'Plancha Abdominal (Plank)',
        mode: 'duration',
        targetSets: 3,
        targetDurationSeconds: 60,
        restSeconds: 45,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/front-plank-with-twist.gif',
      },
    ],
  },
  {
    id: 'routine-ppl-push',
    name: 'Día 1: PUSH (Empuje)',
    description: 'Empuje enfocado en máquinas y poleas: pecho, hombros y tríceps con progresión controlada y segura.',
    targetDays: ['Lunes'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-ppl-push-1',
        exerciseId: 'ex-press-pecho-maquina',
        exerciseName: 'Press de Pecho en Máquina (Chest Press)',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 10,
        targetWeightKg: 30,
        restSeconds: 90,
        notes: 'Sube carga progresivamente. Espalda apoyada.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-chest-press.gif',
      },
      {
        id: 'r-ppl-push-2',
        exerciseId: 'ex-press-mancuernas-inclinado',
        exerciseName: 'Press Inclinado con Mancuernas',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 14,
        restSeconds: 90,
        notes: 'Baja controlado. Si sientes tensión mandibular, vuelve a máquina.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-incline-bench-press.gif',
      },
      {
        id: 'r-ppl-push-3',
        exerciseId: 'ex-jalon-pecho',
        exerciseName: 'Jalón al Pecho en Polea',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 35,
        restSeconds: 60,
        notes: 'Agarre ancho. No lleves la barra detrás de la nuca.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/alternate-lateral-pulldown.gif',
      },
      {
        id: 'r-ppl-push-4',
        exerciseId: 'ex-elevaciones-laterales',
        exerciseName: 'Elevaciones Laterales con Mancuernas',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 8,
        restSeconds: 60,
        notes: 'Peso ligero-moderado. Sube solo hasta la altura del hombro.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-lateral-raise.gif',
      },
      {
        id: 'r-ppl-push-5',
        exerciseId: 'ex-extension-triceps-polea',
        exerciseName: 'Extensión de Tríceps en Polea (Pushdown)',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 20,
        restSeconds: 60,
        notes: 'Codos fijos. Exhala al empujar.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-pushdown.gif',
      },
    ],
  },
  {
    id: 'routine-ppl-pull',
    name: 'Día 2: PULL (Jalón)',
    description: 'Tracción y espalda con soporte de pecho, bíceps y salud del hombro.',
    targetDays: ['Miércoles'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-ppl-pull-1',
        exerciseId: 'ex-jalon-pecho',
        exerciseName: 'Jalón al Pecho en Polea',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 10,
        targetWeightKg: 40,
        restSeconds: 90,
        notes: 'Puedes subir más peso que en semanas anteriores.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/alternate-lateral-pulldown.gif',
      },
      {
        id: 'r-ppl-pull-2',
        exerciseId: 'ex-remo-sentado-maquina',
        exerciseName: 'Remo Sentado en Máquina (Pecho Apoyado)',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 35,
        restSeconds: 90,
        notes: 'Apoya el pecho en el pad.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/lever-seated-row.gif',
      },
      {
        id: 'r-ppl-pull-3',
        exerciseId: 'ex-remo-mancuerna',
        exerciseName: 'Remo Unilateral con Mancuerna (Serrucho)',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 16,
        restSeconds: 60,
        notes: 'Apoyado en banco. Tira con el codo, no con la mano.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/dumbbell-bent-over-row.gif',
      },
      {
        id: 'r-ppl-pull-4',
        exerciseId: 'ex-curl-barra-z',
        exerciseName: 'Curl de Bíceps con Barra Z (EZ Bar Curl)',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 15,
        restSeconds: 60,
        notes: 'Sin balanceo. Barra muy ligera si usas.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/ez-bar-curl.gif',
      },
      {
        id: 'r-ppl-pull-5',
        exerciseId: 'ex-face-pull-polea',
        exerciseName: 'Face Pull en Polea con Cuerda',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 15,
        targetWeightKg: 15,
        restSeconds: 60,
        notes: 'Salud del hombro. Peso ligero.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/cable-kneeling-rear-delt-row-with-rope-male.gif',
      },
    ],
  },
  {
    id: 'routine-ppl-legs',
    name: 'Día 3: LEGS (Pierna)',
    description: 'Pierna completa en máquinas guiadas: cuádriceps, femoral, gemelos y abdomen seguro.',
    targetDays: ['Viernes'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'r-ppl-legs-1',
        exerciseId: 'ex-prensa-piernas',
        exerciseName: 'Prensa de Piernas a 45°',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 10,
        targetWeightKg: 80,
        restSeconds: 90,
        notes: 'Aquí sí puedes buscar sentir el músculo. No bloquees rodillas con fuerza.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/barbell-bench-squat.gif',
      },
      {
        id: 'r-ppl-legs-2',
        exerciseId: 'ex-curl-femoral',
        exerciseName: 'Curl Femoral Sentado en Máquina',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 30,
        restSeconds: 60,
        notes: 'Controla la bajada.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/hamstrings/cable-assisted-inverse-leg-curl.gif',
      },
      {
        id: 'r-ppl-legs-3',
        exerciseId: 'ex-extension-cuadriceps',
        exerciseName: 'Extensión de Cuádriceps en Máquina',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 35,
        restSeconds: 60,
        notes: 'Sube peso respecto a fase anterior.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/lever-leg-extension.gif',
      },
      {
        id: 'r-ppl-legs-4',
        exerciseId: 'ex-elevacion-gemelos-maquina',
        exerciseName: 'Elevación de Gemelos en Máquina de Pie (Calf Raise)',
        mode: 'weight_reps',
        targetSets: 4,
        targetReps: 12,
        targetWeightKg: 40,
        restSeconds: 45,
        notes: 'Rango completo, sin rebotes.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/lever-standing-calf-raise.gif',
      },
      {
        id: 'r-ppl-legs-5',
        exerciseId: 'ex-abdominales-maquina',
        exerciseName: 'Abdominales en Máquina (Machine Crunch)',
        mode: 'weight_reps',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 25,
        restSeconds: 45,
        notes: 'Evita crunches en el suelo que te hagan apretar la mandíbula.',
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/lever-seated-crunch.gif',
      },
    ],
  },
];

export const StorageService = {
  /**
   * Initializes SQLite database and hydrates local storage cache if needed
   */
  async init(): Promise<void> {
    await sqliteService.init();
    if (sqliteService.isReady()) {
      try {
        const prof = await sqliteService.getProfile();
        if (prof) {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(prof));
        }

        const exs = await sqliteService.getExercises();
        if (exs && exs.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exs));
        }

        const rts = await sqliteService.getRoutines();
        if (rts && rts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(rts));
        }

        const weights = await sqliteService.getWeightRecords();
        if (weights && weights.length > 0) {
          localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(weights));
        }

        const workouts = await sqliteService.getWorkoutSessions();
        if (workouts && workouts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(workouts));
        }

        const foods = await sqliteService.getFoodEntries();
        if (foods && foods.length > 0) {
          localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(foods));
        }

        const acts = await sqliteService.getDailyActivities();
        if (acts && acts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITIES, JSON.stringify(acts));
        }

        const actLevel = await sqliteService.getActivityLevel();
        if (actLevel) {
          localStorage.setItem(STORAGE_KEYS.ACTIVITY_LEVEL, actLevel);
        }

        const activeW = await sqliteService.getActiveWorkout();
        if (activeW) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeW));
        }
      } catch (e) {
        console.warn('[StorageService] Error hydrating from SQLite:', e);
      }
    }
  },

  // User Profile
  getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return null;
      return JSON.parse(data) as UserProfile;
    } catch (e) {
      console.error('Error reading profile from localStorage:', e);
      return null;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      sqliteService.saveProfile(profile).catch((e) => console.warn('SQLite saveProfile err:', e));
    } catch (e) {
      console.error('Error saving profile to localStorage:', e);
    }
  },

  hasUserProfile(): boolean {
    const profile = this.getUserProfile();
    return Boolean(
      profile && profile.name?.trim() && profile.birthDate && profile.gender && profile.height > 0
    );
  },

  // Exercise Definitions Catalog
  getExercises(): ExerciseDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
        return DEFAULT_EXERCISES;
      }
      const parsed: ExerciseDefinition[] = JSON.parse(data);
      // Remove any deprecated dual duplicate IDs
      const cleaned = parsed.filter(
        (item) => item.id !== 'ex-pec-deck-dual-pecho-espalda' && item.id !== 'ex-maquina-dual-press-remo'
      );
      // Merge with DEFAULT_EXERCISES to ensure default gifUrls and new exercises are populated
      const defaultMap = new Map<string, ExerciseDefinition>();
      DEFAULT_EXERCISES.forEach((def) => defaultMap.set(def.id, def));

      let hasUpdates = cleaned.length !== parsed.length;
      const merged = cleaned.map((item) => {
        const def = defaultMap.get(item.id);
        if (def) {
          if (!item.equipment && def.equipment) hasUpdates = true;
          return {
            ...item,
            name: def.name || item.name,
            muscleGroup: def.muscleGroup || item.muscleGroup,
            equipment: def.equipment || item.equipment,
            description: def.description || item.description,
            gifUrl: (!item.gifUrl || item.gifUrl.includes('wikimedia.org')) ? def.gifUrl : item.gifUrl,
          };
        }
        return item;
      });

      // Also append any new default exercises not yet in user catalog
      let hasNewExercises = false;
      DEFAULT_EXERCISES.forEach((def) => {
        if (!merged.some((m) => m.id === def.id)) {
          merged.push(def);
          hasNewExercises = true;
        }
      });

      if (hasUpdates || hasNewExercises || merged.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(merged));
      }

      return merged;
    } catch (e) {
      console.error('Error getting exercises:', e);
      return DEFAULT_EXERCISES;
    }
  },

  saveExercise(exercise: ExerciseDefinition): ExerciseDefinition[] {
    const list = this.getExercises();
    const existingIndex = list.findIndex((e) => e.id === exercise.id);
    let updated: ExerciseDefinition[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = exercise;
    } else {
      updated = [exercise, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updated));
    sqliteService.saveExercise(exercise).catch((e) => console.warn('SQLite saveExercise err:', e));
    return updated;
  },

  // Routines
  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
        return DEFAULT_ROUTINES;
      }
      const routines: Routine[] = JSON.parse(data);
      const exercises = this.getExercises();
      const exMap = new Map(exercises.map((e) => [e.id, e]));

      // Populate or fix gifUrls in existing routines
      const updatedRoutines = routines.map((r) => ({
        ...r,
        exercises: r.exercises.map((item) => {
          const def = exMap.get(item.exerciseId);
          if (def && (!item.gifUrl || item.gifUrl.includes('wikimedia.org'))) {
            return { ...item, gifUrl: def.gifUrl };
          }
          return item;
        }),
      }));

      // User routines are preserved as is (deleted routines stay deleted)

      return updatedRoutines;
    } catch (e) {
      console.error('Error getting routines:', e);
      return DEFAULT_ROUTINES;
    }
  },

  saveRoutine(routine: Routine): Routine[] {
    const list = this.getRoutines();
    const existingIndex = list.findIndex((r) => r.id === routine.id);
    let updated: Routine[];
    let toSave: Routine;
    if (existingIndex >= 0) {
      toSave = { ...routine, updatedAt: new Date().toISOString() };
      updated = [...list];
      updated[existingIndex] = toSave;
    } else {
      toSave = {
        ...routine,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [toSave, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updated));
    sqliteService.saveRoutine(toSave).catch((e) => console.warn('SQLite saveRoutine err:', e));
    return updated;
  },

  deleteRoutine(routineId: string): Routine[] {
    const list = this.getRoutines().filter((r) => r.id !== routineId);
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(list));
    sqliteService.deleteRoutine(routineId).catch((e) => console.warn('SQLite deleteRoutine err:', e));
    return list;
  },

  // Weight History
  getWeightRecords(): WeightRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS);
      if (!data) return [];
      const records: WeightRecord[] = JSON.parse(data);
      let hasChanges = false;
      const healed = records.map((r) => {
        if (r.createdAt && r.date) {
          const localCreated = getLocalDateString(new Date(r.createdAt));
          if (localCreated && r.date === addDaysToDateString(localCreated, 1)) {
            hasChanges = true;
            return { ...r, date: localCreated };
          }
        }
        return r;
      });
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(healed));
      }
      // sort by date descending
      return healed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error getting weight records:', e);
      return [];
    }
  },

  saveWeightRecord(record: WeightRecord): WeightRecord[] {
    const list = this.getWeightRecords();
    const existingIndex = list.findIndex((r) => r.id === record.id);
    let updated: WeightRecord[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...list];
    }
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(updated));
    sqliteService.saveWeightRecord(record).catch((e) => console.warn('SQLite saveWeightRecord err:', e));
    return updated;
  },

  deleteWeightRecord(recordId: string): WeightRecord[] {
    const list = this.getWeightRecords().filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(list));
    sqliteService.deleteWeightRecord(recordId).catch((e) => console.warn('SQLite deleteWeightRecord err:', e));
    return list;
  },

  getLatestWeight(): WeightRecord | null {
    const records = this.getWeightRecords();
    return records.length > 0 ? records[0] : null;
  },

  // Workout Sessions
  getWorkoutSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return [];
      const list = JSON.parse(data) as WorkoutSession[];
      let hasChanges = false;
      const healed = list.map((s) => {
        const refDate = s.completedAt || s.startedAt;
        if (refDate && s.date) {
          const localCreated = getLocalDateString(new Date(refDate));
          if (localCreated && s.date === addDaysToDateString(localCreated, 1)) {
            hasChanges = true;
            return { ...s, date: localCreated };
          }
        }
        return s;
      });
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(healed));
      }
      return healed;
    } catch (e) {
      console.error('Error getting workout sessions:', e);
      return [];
    }
  },

  saveWorkoutSession(session: WorkoutSession): WorkoutSession[] {
    const list = this.getWorkoutSessions();
    const existingIndex = list.findIndex((s) => s.id === session.id);
    let updated: WorkoutSession[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = session;
    } else {
      updated = [session, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(updated));
    sqliteService.saveWorkoutSession(session).catch((e) => console.warn('SQLite saveWorkoutSession err:', e));
    return updated;
  },

  deleteWorkoutSession(sessionId: string): WorkoutSession[] {
    const list = this.getWorkoutSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(list));
    sqliteService.deleteWorkoutSession(sessionId).catch((e) => console.warn('SQLite deleteWorkoutSession err:', e));
    return list;
  },

  // Daily Activity (Steps & Active Calories)
  getDailyActivities(): DailyActivity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITIES);
      if (!data) return [];
      return JSON.parse(data) as DailyActivity[];
    } catch (e) {
      console.error('Error getting daily activities:', e);
      return [];
    }
  },

  getDailyActivity(date: string): DailyActivity | null {
    const list = this.getDailyActivities();
    return list.find((a) => a.date === date) || null;
  },

  saveDailyActivity(activity: DailyActivity): DailyActivity[] {
    const list = this.getDailyActivities();
    const existingIndex = list.findIndex((a) => a.date === activity.date);
    let updated: DailyActivity[];
    let toSave: DailyActivity;
    if (existingIndex >= 0) {
      toSave = { ...list[existingIndex], ...activity };
      updated = [...list];
      updated[existingIndex] = toSave;
    } else {
      toSave = activity;
      updated = [activity, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITIES, JSON.stringify(updated));
    sqliteService.saveDailyActivity(toSave).catch((e) => console.warn('SQLite saveDailyActivity err:', e));
    return updated;
  },

  // Food & Nutrition Entries
  getFoodEntries(): FoodEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
      if (!data) return [];
      const entries = JSON.parse(data) as FoodEntry[];
      let hasChanges = false;
      const healed = entries.map((e) => {
        if (e.createdAt && e.date) {
          const localCreated = getLocalDateString(new Date(e.createdAt));
          if (localCreated && e.date === addDaysToDateString(localCreated, 1)) {
            hasChanges = true;
            return { ...e, date: localCreated };
          }
        }
        return e;
      });
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(healed));
      }
      return healed;
    } catch (e) {
      console.error('Error reading food entries:', e);
      return [];
    }
  },

  saveFoodEntry(entry: FoodEntry): FoodEntry[] {
    const list = this.getFoodEntries();
    const existingIndex = list.findIndex((f) => f.id === entry.id);
    let updated: FoodEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...list];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(updated));
      sqliteService.saveFoodEntry(entry).catch((e) => console.warn('SQLite saveFoodEntry err:', e));
    } catch (e) {
      console.error('Error saving food entry:', e);
    }
    return updated;
  },

  deleteFoodEntry(id: string): FoodEntry[] {
    const list = this.getFoodEntries();
    const updated = list.filter((f) => f.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(updated));
      sqliteService.deleteFoodEntry(id).catch((e) => console.warn('SQLite deleteFoodEntry err:', e));
    } catch (e) {
      console.error('Error deleting food entry:', e);
    }
    return updated;
  },

  getActivityLevel(): ActivityLevel {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LEVEL) as ActivityLevel;
      if (val && ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(val)) {
        return val;
      }
      return 'light';
    } catch {
      return 'light';
    }
  },

  saveActivityLevel(level: ActivityLevel): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LEVEL, level);
      sqliteService.saveActivityLevel(level).catch((e) => console.warn('SQLite saveActivityLevel err:', e));
    } catch (e) {
      console.error('Error saving activity level:', e);
    }
  },

  // Active in-progress workout persistence
  getActiveWorkout(): WorkoutSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (!data) return null;
      return JSON.parse(data) as WorkoutSession;
    } catch (e) {
      console.error('Error reading active workout:', e);
      return null;
    }
  },

  saveActiveWorkout(workout: WorkoutSession | null): void {
    try {
      if (!workout) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
      }
      sqliteService.saveActiveWorkout(workout).catch((e) => console.warn('SQLite saveActiveWorkout err:', e));
    } catch (e) {
      console.error('Error saving active workout:', e);
    }
  },

  // Backup & Restore Utilities (Google Drive / File Export & Import)
  getLastBackupDate(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_AT);
    } catch {
      return null;
    }
  },

  exportBackupData(): FitTrackBackupPayload {
    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_AT, nowIso);
    } catch {
      // ignore
    }
    const allExercises = this.getExercises();
    const defaultIds = new Set(DEFAULT_EXERCISES.map((d) => d.id));
    const customExercises = allExercises.filter((ex) => !defaultIds.has(ex.id));

    return {
      appName: 'fitGo!',
      version: APP_VERSION,
      exportedAt: nowIso,
      profile: this.getUserProfile(),
      routines: this.getRoutines(),
      customExercises,
      weightRecords: this.getWeightRecords(),
      workoutSessions: this.getWorkoutSessions(),
      foodEntries: this.getFoodEntries(),
      dailyActivities: this.getDailyActivities(),
      activityLevel: this.getActivityLevel(),
    };
  },

  async importBackupData(payload: Partial<FitTrackBackupPayload>): Promise<boolean> {
    if (!payload || typeof payload !== 'object') {
      throw new Error('El archivo de respaldo no es válido.');
    }
    const hasValidKeys =
      payload.appName === 'fitGo!' ||
      payload.appName === 'fitGo' ||
      payload.appName === 'FitTrack' ||
      payload.profile !== undefined ||
      Array.isArray(payload.workoutSessions) ||
      Array.isArray(payload.routines) ||
      Array.isArray(payload.weightRecords);

    if (!hasValidKeys) {
      throw new Error('El archivo seleccionado no pertenece a un respaldo de fitGo!.');
    }

    // Clear existing SQLite tables before re-hydrating
    await sqliteService.clearAllData().catch((e) => console.warn('SQLite clear err:', e));

    if (payload.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(payload.profile));
      await sqliteService.saveProfile(payload.profile).catch(() => {});
    }

    if (Array.isArray(payload.customExercises) && payload.customExercises.length > 0) {
      const defaultIds = new Set(DEFAULT_EXERCISES.map((d) => d.id));
      const mergedExercises = [
        ...DEFAULT_EXERCISES,
        ...payload.customExercises.filter((c) => !defaultIds.has(c.id)),
      ];
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(mergedExercises));
      for (const ex of payload.customExercises) {
        await sqliteService.saveExercise(ex).catch(() => {});
      }
    }

    if (Array.isArray(payload.routines)) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(payload.routines));
      for (const r of payload.routines) {
        await sqliteService.saveRoutine(r).catch(() => {});
      }
    }

    if (Array.isArray(payload.weightRecords)) {
      localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(payload.weightRecords));
      for (const w of payload.weightRecords) {
        await sqliteService.saveWeightRecord(w).catch(() => {});
      }
    }

    if (Array.isArray(payload.workoutSessions)) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(payload.workoutSessions));
      for (const s of payload.workoutSessions) {
        await sqliteService.saveWorkoutSession(s).catch(() => {});
      }
    }

    if (Array.isArray(payload.foodEntries)) {
      localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(payload.foodEntries));
      for (const f of payload.foodEntries) {
        await sqliteService.saveFoodEntry(f).catch(() => {});
      }
    }

    if (Array.isArray(payload.dailyActivities)) {
      localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITIES, JSON.stringify(payload.dailyActivities));
      for (const a of payload.dailyActivities) {
        await sqliteService.saveDailyActivity(a).catch(() => {});
      }
    }

    if (payload.activityLevel) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LEVEL, payload.activityLevel);
      await sqliteService.saveActivityLevel(payload.activityLevel).catch(() => {});
    }

    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_AT, new Date().toISOString());
    return true;
  },

  // --- Routines & Exercises JSON Template / Export / Import (v1.0.5) ---
  getRoutinesJsonTemplate(): RoutinesJsonPackage {
    return {
      format: 'fitgo-routines-v1',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      _guia_de_formato: {
        instrucciones:
          'Llena la lista de "exercises" (si deseas agregar ejercicios nuevos al catálogo) y la lista de "routines" con tus rutinas. Si un ejercicio dentro de una rutina aún no existe en el catálogo, fitGo! lo creará automáticamente por su nombre ("exerciseName").',
        grupos_musculares_validos: [
          'pecho',
          'espalda',
          'piernas',
          'hombros',
          'brazos',
          'core',
          'cardio',
          'cuerpo_completo',
        ],
        equipos_validos: [
          'sin_equipo',
          'mancuernas',
          'barra',
          'maquina',
          'polea',
          'bandas',
          'otro',
        ],
        modos_de_medicion: {
          weight_reps: 'Peso (kg) y Repeticiones',
          reps_only: 'Solo Repeticiones (ej. calistenia / peso corporal)',
          duration: 'Tiempo en segundos (ej. plancha / cardio)',
        },
        dias_validos: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      },
      exercises: [
        {
          id: 'ex-custom-hip-thrust',
          name: 'Hip Thrust con Barra',
          muscleGroup: 'piernas',
          defaultMode: 'weight_reps',
          equipment: 'barra',
          description: 'Empuje de cadera con espalda apoyada en banco para glúteos e isquiotibiales.',
        },
        {
          id: 'ex-custom-dominadas-neutras',
          name: 'Dominadas Agarre Neutro',
          muscleGroup: 'espalda',
          defaultMode: 'reps_only',
          equipment: 'sin_equipo',
          description: 'Tracción vertical con palmas enfrentadas.',
        },
      ],
      routines: [
        {
          name: 'Ejemplo: Empuje Hipertrofia (Push Day)',
          description: 'Rutina enfocada en pecho, hombros y tríceps.',
          targetDays: ['Lunes', 'Jueves'],
          exercises: [
            {
              id: 'cfg-ejemplo-1',
              exerciseId: 'ex-press-banca',
              exerciseName: 'Press de Banca Plano',
              mode: 'weight_reps',
              targetSets: 4,
              targetReps: 8,
              targetWeightKg: 60,
              restSeconds: 90,
              notes: 'Bajar controlado en 2 segundos.',
              setsConfig: [
                { setNumber: 1, targetWeightKg: 55, targetReps: 10 },
                { setNumber: 2, targetWeightKg: 60, targetReps: 8 },
                { setNumber: 3, targetWeightKg: 62.5, targetReps: 8 },
                { setNumber: 4, targetWeightKg: 65, targetReps: 6 },
              ],
            },
            {
              id: 'cfg-ejemplo-2',
              exerciseId: 'ex-press-militar',
              exerciseName: 'Press Militar con Mancuernas',
              mode: 'weight_reps',
              targetSets: 3,
              targetReps: 10,
              targetWeightKg: 20,
              restSeconds: 75,
            },
            {
              id: 'cfg-ejemplo-3',
              exerciseId: 'ex-flexiones',
              exerciseName: 'Flexiones de Pecho (Push-ups)',
              mode: 'reps_only',
              targetSets: 3,
              targetReps: 15,
              restSeconds: 60,
            },
          ],
        },
      ],
    };
  },

  exportRoutinesAndExercises(): RoutinesJsonPackage {
    const allExercises = this.getExercises();
    const defaultIds = new Set(DEFAULT_EXERCISES.map((d) => d.id));
    const customExercises = allExercises.filter((ex) => !defaultIds.has(ex.id));

    return {
      format: 'fitgo-routines-v1',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      _guia_de_formato: this.getRoutinesJsonTemplate()._guia_de_formato,
      exercises: customExercises,
      routines: this.getRoutines(),
    };
  },

  async importRoutinesAndExercises(
    rawPayload: any,
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{ importedRoutines: number; importedExercises: number }> {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new Error('El archivo JSON no tiene un formato válido.');
    }

    // Normalize input: support { routines, exercises }, or direct array of routines, or single routine
    let rawExercises: any[] = [];
    let rawRoutines: any[] = [];

    if (Array.isArray(rawPayload)) {
      rawRoutines = rawPayload;
    } else if (Array.isArray(rawPayload.routines) || Array.isArray(rawPayload.exercises)) {
      rawExercises = Array.isArray(rawPayload.exercises) ? rawPayload.exercises : [];
      rawRoutines = Array.isArray(rawPayload.routines) ? rawPayload.routines : [];
    } else if (rawPayload.name && Array.isArray(rawPayload.exercises)) {
      // Single routine object passed directly
      rawRoutines = [rawPayload];
    } else {
      throw new Error(
        'El JSON debe contener una lista de "routines" y/o "exercises". Descarga el formato de plantilla para ver un ejemplo.'
      );
    }

    const validMuscleGroups = new Set<MuscleGroup>([
      'pecho',
      'espalda',
      'piernas',
      'hombros',
      'brazos',
      'core',
      'cardio',
      'cuerpo_completo',
    ]);
    const validEquipments = new Set<EquipmentType>([
      'sin_equipo',
      'mancuernas',
      'barra',
      'maquina',
      'polea',
      'bandas',
      'otro',
    ]);
    const validModes = new Set<ExerciseMeasurementMode>(['weight_reps', 'reps_only', 'duration']);

    const normalizeSlug = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const catalog = [...this.getExercises()];
    let importedExercisesCount = 0;

    const findOrCreateCatalogExercise = (item: {
      id?: string;
      exerciseId?: string;
      name?: string;
      exerciseName?: string;
      muscleGroup?: string;
      defaultMode?: string;
      mode?: string;
      equipment?: string;
      description?: string;
      gifUrl?: string;
    }): ExerciseDefinition => {
      const targetId = (item.id || item.exerciseId || '').trim();
      const targetName = (item.name || item.exerciseName || 'Ejercicio Personalizado').trim();

      // 1. Match by ID
      if (targetId) {
        const byId = catalog.find((e) => e.id === targetId);
        if (byId) return byId;
      }

      // 2. Match by case-insensitive name
      const byName = catalog.find(
        (e) => e.name.trim().toLowerCase() === targetName.toLowerCase()
      );
      if (byName) return byName;

      // 3. Create new exercise in catalog
      const newId = targetId || `ex-custom-${normalizeSlug(targetName) || Date.now()}`;
      const rawMuscle = (item.muscleGroup || 'cuerpo_completo').toLowerCase() as MuscleGroup;
      const muscleGroup: MuscleGroup = validMuscleGroups.has(rawMuscle)
        ? rawMuscle
        : 'cuerpo_completo';
      const rawMode = (item.defaultMode || item.mode || 'weight_reps') as ExerciseMeasurementMode;
      const defaultMode: ExerciseMeasurementMode = validModes.has(rawMode)
        ? rawMode
        : 'weight_reps';
      const rawEq = (item.equipment || 'otro').toLowerCase() as EquipmentType;
      const equipment: EquipmentType = validEquipments.has(rawEq) ? rawEq : 'otro';

      const created: ExerciseDefinition = {
        id: newId,
        name: targetName,
        muscleGroup,
        defaultMode,
        equipment,
        description: item.description || undefined,
        gifUrl: item.gifUrl || undefined,
      };

      catalog.push(created);
      this.saveExercise(created);
      importedExercisesCount++;
      return created;
    };

    // Process explicit exercises list first
    for (const rawEx of rawExercises) {
      if (!rawEx || typeof rawEx !== 'object') continue;
      const exName = (rawEx.name || rawEx.exerciseName || '').trim();
      if (!exName) continue;

      const existingIdx = catalog.findIndex(
        (e) =>
          (rawEx.id && e.id === rawEx.id) ||
          e.name.trim().toLowerCase() === exName.toLowerCase()
      );

      const rawMuscle = (rawEx.muscleGroup || 'cuerpo_completo').toLowerCase() as MuscleGroup;
      const muscleGroup: MuscleGroup = validMuscleGroups.has(rawMuscle)
        ? rawMuscle
        : 'cuerpo_completo';
      const rawMode = (rawEx.defaultMode || rawEx.mode || 'weight_reps') as ExerciseMeasurementMode;
      const defaultMode: ExerciseMeasurementMode = validModes.has(rawMode)
        ? rawMode
        : 'weight_reps';
      const rawEq = (rawEx.equipment || 'otro').toLowerCase() as EquipmentType;
      const equipment: EquipmentType = validEquipments.has(rawEq) ? rawEq : 'otro';

      const exDef: ExerciseDefinition = {
        id:
          existingIdx >= 0
            ? catalog[existingIdx].id
            : rawEx.id || `ex-custom-${normalizeSlug(exName) || Date.now()}`,
        name: exName,
        muscleGroup,
        defaultMode,
        equipment,
        description: rawEx.description || (existingIdx >= 0 ? catalog[existingIdx].description : undefined),
        gifUrl: rawEx.gifUrl || (existingIdx >= 0 ? catalog[existingIdx].gifUrl : undefined),
      };

      if (existingIdx >= 0) {
        catalog[existingIdx] = exDef;
      } else {
        catalog.push(exDef);
      }
      this.saveExercise(exDef);
      importedExercisesCount++;
    }

    // Process routines list
    const nowIso = new Date().toISOString();
    const parsedRoutines: Routine[] = [];

    for (let rIdx = 0; rIdx < rawRoutines.length; rIdx++) {
      const rawR = rawRoutines[rIdx];
      if (!rawR || typeof rawR !== 'object') continue;
      const rName = (rawR.name || `Rutina Importada ${rIdx + 1}`).trim();
      const rawExList = Array.isArray(rawR.exercises) ? rawR.exercises : [];

      const routineExercises: RoutineExerciseConfig[] = rawExList
        .filter((item: any) => item && typeof item === 'object')
        .map((item: any, exIdx: number) => {
          const matchedDef = findOrCreateCatalogExercise(item);
          const rawMode = (item.mode || matchedDef.defaultMode || 'weight_reps') as ExerciseMeasurementMode;
          const exMode: ExerciseMeasurementMode = validModes.has(rawMode)
            ? rawMode
            : matchedDef.defaultMode;
          const targetSets = Math.max(1, Number(item.targetSets) || (Array.isArray(item.setsConfig) ? item.setsConfig.length : 3));

          return {
            id: item.id || `r-ex-${Date.now()}-${rIdx}-${exIdx}`,
            exerciseId: matchedDef.id,
            exerciseName: item.exerciseName || item.name || matchedDef.name,
            mode: exMode,
            targetSets,
            targetReps:
              exMode !== 'duration'
                ? Number(item.targetReps) > 0
                  ? Number(item.targetReps)
                  : 10
                : undefined,
            targetWeightKg:
              exMode === 'weight_reps'
                ? item.targetWeightKg !== undefined
                  ? Number(item.targetWeightKg)
                  : 20
                : undefined,
            targetDurationSeconds:
              exMode === 'duration'
                ? Number(item.targetDurationSeconds) > 0
                  ? Number(item.targetDurationSeconds)
                  : 45
                : undefined,
            restSeconds: Number(item.restSeconds) > 0 ? Number(item.restSeconds) : 60,
            notes: item.notes || undefined,
            gifUrl: item.gifUrl || matchedDef.gifUrl,
            setsConfig: Array.isArray(item.setsConfig)
              ? item.setsConfig.map((s: any, sIdx: number) => ({
                  setNumber: Number(s.setNumber) || sIdx + 1,
                  targetReps: s.targetReps !== undefined ? Number(s.targetReps) : undefined,
                  targetWeightKg:
                    s.targetWeightKg !== undefined ? Number(s.targetWeightKg) : undefined,
                  targetDurationSeconds:
                    s.targetDurationSeconds !== undefined
                      ? Number(s.targetDurationSeconds)
                      : undefined,
                }))
              : undefined,
          };
        });

      parsedRoutines.push({
        id: rawR.id || `routine-import-${Date.now()}-${rIdx}`,
        name: rName,
        description: rawR.description || undefined,
        targetDays: Array.isArray(rawR.targetDays) ? rawR.targetDays : undefined,
        exercises: routineExercises,
        createdAt: rawR.createdAt || nowIso,
        updatedAt: nowIso,
      });
    }

    if (parsedRoutines.length === 0 && importedExercisesCount === 0) {
      throw new Error('No se encontraron rutinas ni ejercicios válidos en el archivo JSON.');
    }

    if (parsedRoutines.length > 0) {
      let finalRoutines: Routine[];
      if (mode === 'replace') {
        finalRoutines = parsedRoutines;
      } else {
        const currentRoutines = this.getRoutines();
        const updatedList = [...currentRoutines];
        for (const imported of parsedRoutines) {
          const existingIndex = updatedList.findIndex(
            (r) =>
              r.id === imported.id ||
              r.name.trim().toLowerCase() === imported.name.trim().toLowerCase()
          );
          if (existingIndex >= 0) {
            updatedList[existingIndex] = { ...imported, id: updatedList[existingIndex].id };
          } else {
            updatedList.unshift(imported);
          }
        }
        finalRoutines = updatedList;
      }

      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(finalRoutines));
      for (const r of finalRoutines) {
        await sqliteService.saveRoutine(r).catch(() => {});
      }
    }

    return {
      importedRoutines: parsedRoutines.length,
      importedExercises: importedExercisesCount,
    };
  },

  // Clear data utility
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.FOOD_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LEVEL);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.DAILY_ACTIVITIES);
    sqliteService.clearAllData().catch((e) => console.warn('SQLite clearAllData err:', e));
  },
};

// BMI (IMC) Utilities

export interface SuggestedTargetWeightInfo {
  targetWeight: number;
  diffKg: number;
  category: string;
  reason: string;
}

export function getSuggestedTargetWeight(
  weightKg: number,
  heightCm: number
): SuggestedTargetWeightInfo {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      targetWeight: 70,
      diffKg: 0,
      category: 'Sin datos',
      reason: 'Ingresa peso y estatura válidos.',
    };
  }

  const bmi = calculateBmi(weightKg, heightCm);
  let diffKg = 0;
  let reason = '';

  if (bmi >= 25.0) {
    // Sobrepeso u Obesidad: restar 5 kg
    diffKg = -5;
    reason = `Sobrepeso detectado (IMC ${bmi}): Se restan 5 kg para generar un déficit seguro y descenso progresivo.`;
  } else if (bmi < 18.5) {
    // Bajo peso: sumar 5 kg
    diffKg = 5;
    reason = `Bajo peso detectado (IMC ${bmi}): Se suman 5 kg para recuperación muscular y alcanzar un peso saludable.`;
  } else {
    // Peso ideal / normal: 0 kg (mantener peso actual)
    diffKg = 0;
    reason = `Peso ideal (IMC ${bmi}): Mantén tu peso actual (0 kg de diferencia) enfocado en tonificación.`;
  }

  const targetWeight = Number(Math.max(30, weightKg + diffKg).toFixed(1));
  const bmiCat = getBmiCategory(bmi);

  return {
    targetWeight,
    diffKg,
    category: bmiCat.category,
    reason,
  };
}


export const WEEK_DAYS_CONFIG = [
  { dayIndex: 1, short: 'Lun', full: 'Lunes' },
  { dayIndex: 2, short: 'Mar', full: 'Martes' },
  { dayIndex: 3, short: 'Mié', full: 'Miércoles' },
  { dayIndex: 4, short: 'Jue', full: 'Jueves' },
  { dayIndex: 5, short: 'Vie', full: 'Viernes' },
  { dayIndex: 6, short: 'Sáb', full: 'Sábado' },
  { dayIndex: 0, short: 'Dom', full: 'Domingo' },
];

export function getStartOfWeek(date: Date, startDay: number = 1): Date {
  const d = new Date(date);
  const currentDay = d.getDay(); // 0 is Sunday, 1 is Monday ...
  const diff = (currentDay - startDay + 7) % 7;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getOrderedWeekDayNames(startDay: number = 1): { dayIndex: number; short: string; full: string }[] {
  const dayMap: Record<number, { short: string; full: string }> = {
    0: { short: 'Dom', full: 'Domingo' },
    1: { short: 'Lun', full: 'Lunes' },
    2: { short: 'Mar', full: 'Martes' },
    3: { short: 'Mié', full: 'Miércoles' },
    4: { short: 'Jue', full: 'Jueves' },
    5: { short: 'Vie', full: 'Viernes' },
    6: { short: 'Sáb', full: 'Sábado' },
  };

  const list: { dayIndex: number; short: string; full: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = (startDay + i) % 7;
    list.push({ dayIndex: idx, short: dayMap[idx].short, full: dayMap[idx].full });
  }
  return list;
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi <= 0) {
    return {
      category: 'Sin datos',
      rangeText: '-',
      color: 'medium',
      description: 'Ingresa tu peso y estatura.',
    };
  }
  if (bmi < 18.5) {
    return {
      category: 'Bajo peso',
      rangeText: '< 18.5',
      color: 'warning',
      description: 'Por debajo del peso recomendado para tu estatura.',
    };
  }
  if (bmi < 25.0) {
    return {
      category: 'Peso normal',
      rangeText: '18.5 - 24.9',
      color: 'success',
      description: '¡Excelente! Te encuentras en un rango saludable.',
    };
  }
  if (bmi < 30.0) {
    return {
      category: 'Sobrepeso',
      rangeText: '25.0 - 29.9',
      color: 'warning',
      description: 'Ligeramente por encima del peso ideal. Buen momento para entrenar.',
    };
  }
  if (bmi < 35.0) {
    return {
      category: 'Obesidad Grado I',
      rangeText: '30.0 - 34.9',
      color: 'danger',
      description: 'Riesgo moderado para la salud cardiovascular.',
    };
  }
  if (bmi < 40.0) {
    return {
      category: 'Obesidad Grado II',
      rangeText: '35.0 - 39.9',
      color: 'danger',
      description: 'Riesgo alto. Se aconseja seguimiento médico y ejercicio.',
    };
  }
  return {
    category: 'Obesidad Grado III',
    rangeText: '≥ 40.0',
    color: 'danger',
    description: 'Riesgo muy alto. Consulta con un profesional de la salud.',
  };
}

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Returns a date string in YYYY-MM-DD format based on local device time,
 * completely avoiding UTC offset shifts where toISOString() yields tomorrow's date after 18:00 (6:00 PM).
 */
export function getLocalDateString(dateInput: Date | string = new Date()): string {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Safely adds or subtracts days to a YYYY-MM-DD string using local date calendar calculations.
 */
export function addDaysToDateString(dateStr: string, daysToAdd: number): string {
  if (!dateStr || !dateStr.includes('-')) {
    dateStr = getLocalDateString();
  }
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + daysToAdd);
  return getLocalDateString(dateObj);
}

/**
 * Formats any date string (YYYY-MM-DD or ISO) into dd/mm/yyyy
 */
export function formatDateDDMMYYYY(dateString: string | undefined | null): string {
  if (!dateString) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats any date string into dd/mm for compact labels
 */
export function formatDateDDMM(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const matchSlash = dateString.match(/^(\d{1,2})\/(\d{1,2})/);
  if (matchSlash) {
    return `${matchSlash[1].padStart(2, '0')}/${matchSlash[2].padStart(2, '0')}`;
  }
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, , month, day] = match;
    return `${day}/${month}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Calculates scientifically recommended daily calorie intake
 * based on user's BMR (Mifflin-St Jeor), Activity Level, BMI, and Target Weight
 */
export function calculateCalorieRecommendation(
  profile: UserProfile | null,
  latestWeightKg?: number,
  activityLevel: ActivityLevel = 'light'
): CalorieRecommendation {
  const weight = latestWeightKg && latestWeightKg > 0 ? latestWeightKg : (profile?.initialWeight || profile?.targetWeight || 70);
  const height = profile?.height && profile.height > 0 ? profile.height : 170;
  const age = profile?.birthDate ? calculateAge(profile.birthDate) : 25;
  const gender = profile?.gender || 'male';

  // Mifflin-St Jeor equation (gold standard for BMR / TMB)
  let bmr = 10 * weight + 6.25 * height - 5 * (age > 0 ? age : 25);
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  bmr = Math.max(900, Math.round(bmr));

  // Activity level multipliers for TDEE (Gasto Total)
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const factor = multipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * factor);

  // BMI (IMC) calculation & category
  const bmi = calculateBmi(weight, height);
  const bmiCat = getBmiCategory(bmi);

  let targetCalories = tdee;
  let deficitOrSurplus = 0;
  let adjustmentReason = 'Mantenimiento del peso actual y recomposición corporal.';

  // Target weight vs current weight logic
  if (profile?.targetWeight && profile.targetWeight > 0) {
    const diff = Number((weight - profile.targetWeight).toFixed(1));
    if (diff > 0.5) {
      // Need deficit to lose weight
      const deficit = diff >= 10 ? 500 : 400;
      deficitOrSurplus = -deficit;
      targetCalories = Math.max(gender === 'female' ? 1200 : 1500, tdee - deficit);
      adjustmentReason = `Déficit de ${tdee - targetCalories} kcal para quemar grasa progresivamente hacia tu objetivo de ${profile.targetWeight} kg.`;
    } else if (diff < -0.5) {
      // Need surplus to gain weight / muscle
      const surplus = Math.abs(diff) >= 8 ? 450 : 350;
      deficitOrSurplus = surplus;
      targetCalories = tdee + surplus;
      adjustmentReason = `Superávit de +${surplus} kcal para ganar masa muscular hacia tu objetivo de ${profile.targetWeight} kg.`;
    } else {
      adjustmentReason = `Mantenimiento: estás en tu meta de peso (${profile.targetWeight} kg). ¡A mantener y tonificar!`;
    }
  } else {
    // If no target weight set, use BMI to advise
    if (bmi >= 25.0) {
      const deficit = 450;
      deficitOrSurplus = -deficit;
      targetCalories = Math.max(gender === 'female' ? 1200 : 1500, tdee - deficit);
      adjustmentReason = `Déficit de -${deficit} kcal recomendado por tu IMC (${bmi} - ${bmiCat.category}) para un descenso saludable.`;
    } else if (bmi > 0 && bmi < 18.5) {
      const surplus = 400;
      deficitOrSurplus = surplus;
      targetCalories = tdee + surplus;
      adjustmentReason = `Superávit de +${surplus} kcal recomendado por tu IMC (${bmi} - ${bmiCat.category}) para alcanzar tu peso normal.`;
    } else {
      adjustmentReason = `Mantenimiento recomendado para sostener tu IMC saludable (${bmi} - ${bmiCat.category}).`;
    }
  }

  return {
    bmr,
    tdee,
    targetCalories,
    adjustmentReason,
    bmi,
    bmiCategory: bmiCat.category,
    deficitOrSurplus,
  };
}

/**
 * Estimates calories burned during a gym strength training workout session.
 * Standard Compendium of Physical Activities MET value for resistance training ~ 6.0 METs.
 */
export function calculateEstimatedCaloriesBurned(
  durationMinutes: number,
  weightKg: number = 70
): number {
  const rate = 0.10; // ~6.0 METs normalized kcal/kg/min
  const safeWeight = Math.max(weightKg || 70, 40);
  const safeMins = Math.max(durationMinutes || 1, 1);
  return Math.max(Math.round(rate * safeWeight * safeMins), 15);
}


