import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import {
  UserProfile,
  ExerciseDefinition,
  Routine,
  WeightRecord,
  WorkoutSession,
  BmiCategory,
  FoodEntry,
  ActivityLevel,
  CalorieRecommendation,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'fittrack_user_profile',
  EXERCISES: 'fittrack_exercise_catalog',
  ROUTINES: 'fittrack_routines_list',
  WEIGHT_RECORDS: 'fittrack_weight_history',
  WORKOUT_SESSIONS: 'fittrack_workout_history',
  FOOD_ENTRIES: 'fittrack_food_entries',
  ACTIVITY_LEVEL: 'fittrack_user_activity_level',
  ACTIVE_WORKOUT: 'fittrack_active_workout',
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

      // Append default routines if not yet in user's saved routines
      let hasNewRoutines = false;
      DEFAULT_ROUTINES.forEach((defR) => {
        if (!updatedRoutines.some((r) => r.id === defR.id)) {
          updatedRoutines.push(defR);
          hasNewRoutines = true;
        }
      });

      if (hasNewRoutines) {
        localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updatedRoutines));
      }

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
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...routine, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        { ...routine, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...list,
      ];
    }
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updated));
    return updated;
  },

  deleteRoutine(routineId: string): Routine[] {
    const list = this.getRoutines().filter((r) => r.id !== routineId);
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(list));
    return list;
  },

  // Weight History
  getWeightRecords(): WeightRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS);
      if (!data) return [];
      const records: WeightRecord[] = JSON.parse(data);
      // sort by date descending
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    return updated;
  },

  deleteWeightRecord(recordId: string): WeightRecord[] {
    const list = this.getWeightRecords().filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(list));
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
      return JSON.parse(data);
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
    return updated;
  },

  deleteWorkoutSession(sessionId: string): WorkoutSession[] {
    const list = this.getWorkoutSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(list));
    return list;
  },

  // Food & Nutrition Entries
  getFoodEntries(): FoodEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
      if (!data) return [];
      return JSON.parse(data) as FoodEntry[];
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
    } catch (e) {
      console.error('Error saving active workout:', e);
    }
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
  },
};

// BMI (IMC) Utilities
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
  const weight = latestWeightKg && latestWeightKg > 0 ? latestWeightKg : profile?.targetWeight || 70;
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


