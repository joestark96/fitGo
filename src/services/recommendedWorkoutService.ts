import {
  EquipmentType,
  ExerciseDefinition,
  MuscleGroup,
  Routine,
  RoutineExerciseConfig,
  RoutineSetTarget,
  WorkoutSession,
} from '../types';
import {
  ExerciseFocusFilter,
  FOCUS_FILTER_LABELS,
  matchesExerciseFocus,
} from './exerciseClassification';

export interface RecommendedExerciseMeta {
  config: RoutineExerciseConfig;
  muscleGroup: MuscleGroup;
  source: 'history' | 'routine' | 'default';
  lastSessionDate?: string;
}

export interface GenerateRecommendedWorkoutOptions {
  selectedMuscles: ExerciseFocusFilter[];
  exercises: ExerciseDefinition[];
  workoutSessions: WorkoutSession[];
  routines?: Routine[];
  totalExercises?: number;
  equipmentFilter?: EquipmentType | 'todos' | EquipmentType[];
  excludeExerciseIds?: string[];
  variationSeed?: number;
}

export interface GeneratedWorkoutResult {
  suggestedName: string;
  suggestedDescription: string;
  items: RecommendedExerciseMeta[];
}

export const MUSCLE_GROUP_LABELS = FOCUS_FILTER_LABELS;

const FULL_BODY_GROUPS: ExerciseFocusFilter[] = [
  'pecho',
  'espalda',
  'piernas',
  'hombros',
  'brazos',
  'core',
];

function getDefaultWeightKgForEquipment(equipment?: EquipmentType): number {
  switch (equipment) {
    case 'barra':
    case 'maquina':
      return 20;
    case 'mancuernas':
    case 'polea':
      return 10;
    case 'bandas':
      return 5;
    default:
      return 15;
  }
}

/**
 * Finds the most recent completed workout session data for a given exercise,
 * or falls back to existing routines if no workout history exists.
 */
function findLastPerformanceForExercise(
  exercise: ExerciseDefinition,
  sortedCompletedSessions: WorkoutSession[],
  routines: Routine[]
): {
  setsCount: number;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  perSetWeights?: (number | undefined)[];
  perSetReps?: (number | undefined)[];
  perSetDurations?: (number | undefined)[];
  source: 'history' | 'routine' | 'default';
  lastSessionDate?: string;
} {
  const normalizedName = exercise.name.trim().toLowerCase();

  for (const session of sortedCompletedSessions) {
    const match = (session.exercises || []).find(
      (ex) =>
        ex.exerciseId === exercise.id ||
        ex.exerciseName.trim().toLowerCase() === normalizedName
    );
    if (!match || !match.sets || match.sets.length === 0) continue;

    const completedSets = match.sets.filter((s) => s.completed);
    const relevantSets = completedSets.length > 0 ? completedSets : match.sets;

    const setsCount = Math.min(6, Math.max(2, relevantSets.length));
    const perSetWeights = relevantSets.map((s) => s.actualWeightKg);
    const perSetReps = relevantSets.map((s) => s.actualReps);
    const perSetDurations = relevantSets.map((s) => s.actualDurationSeconds);

    const validWeights = perSetWeights.filter(
      (w): w is number => typeof w === 'number' && !isNaN(w) && w > 0
    );
    const validReps = perSetReps.filter(
      (r): r is number => typeof r === 'number' && !isNaN(r) && r > 0
    );
    const validDurations = perSetDurations.filter(
      (d): d is number => typeof d === 'number' && !isNaN(d) && d > 0
    );

    const avgWeight =
      validWeights.length > 0
        ? Number((validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(1))
        : undefined;
    const avgReps =
      validReps.length > 0
        ? Math.round(validReps.reduce((a, b) => a + b, 0) / validReps.length)
        : undefined;
    const avgDuration =
      validDurations.length > 0
        ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
        : undefined;

    if (
      exercise.defaultMode === 'weight_reps' &&
      avgWeight === undefined &&
      avgReps === undefined
    ) {
      continue;
    }

    return {
      setsCount,
      weightKg: avgWeight,
      reps: avgReps ?? 10,
      durationSeconds: avgDuration ?? 45,
      perSetWeights,
      perSetReps,
      perSetDurations,
      source: 'history',
      lastSessionDate: session.completedAt || session.date,
    };
  }

  // Fallback: check if user already configured this exercise in an existing routine
  for (const routine of routines) {
    const match = (routine.exercises || []).find(
      (re) =>
        re.exerciseId === exercise.id ||
        re.exerciseName.trim().toLowerCase() === normalizedName
    );
    if (match) {
      const setsCount = Math.min(6, Math.max(2, match.targetSets || match.setsConfig?.length || 3));
      const firstSet = match.setsConfig?.[0];
      return {
        setsCount,
        weightKg:
          exercise.defaultMode === 'weight_reps'
            ? firstSet?.targetWeightKg ?? match.targetWeightKg ?? getDefaultWeightKgForEquipment(exercise.equipment)
            : undefined,
        reps: exercise.defaultMode !== 'duration' ? firstSet?.targetReps ?? match.targetReps ?? 10 : undefined,
        durationSeconds:
          exercise.defaultMode === 'duration'
            ? firstSet?.targetDurationSeconds ?? match.targetDurationSeconds ?? 45
            : undefined,
        perSetWeights: match.setsConfig?.map((s) => s.targetWeightKg),
        perSetReps: match.setsConfig?.map((s) => s.targetReps),
        perSetDurations: match.setsConfig?.map((s) => s.targetDurationSeconds),
        source: 'routine',
      };
    }
  }

  return {
    setsCount: 3,
    weightKg:
      exercise.defaultMode === 'weight_reps'
        ? getDefaultWeightKgForEquipment(exercise.equipment)
        : undefined,
    reps: exercise.defaultMode !== 'duration' ? 10 : undefined,
    durationSeconds: exercise.defaultMode === 'duration' ? 45 : undefined,
    source: 'default',
  };
}

/**
 * Generates a recommended workout routine for the selected muscle groups,
 * prioritizing exercises with recent history and pre-filling weights/reps
 * based on the user's most recent completed workouts.
 */
export function generateRecommendedWorkout(
  options: GenerateRecommendedWorkoutOptions
): GeneratedWorkoutResult {
  const {
    selectedMuscles,
    exercises,
    workoutSessions,
    routines = [],
    totalExercises,
    equipmentFilter = 'todos',
    excludeExerciseIds = [],
    variationSeed = 0,
  } = options;

  const allowedEquipments: Set<EquipmentType> | null = Array.isArray(equipmentFilter)
    ? equipmentFilter.length > 0
      ? new Set(equipmentFilter)
      : null
    : equipmentFilter !== 'todos'
      ? new Set([equipmentFilter])
      : null;

  const targetGroups: ExerciseFocusFilter[] = selectedMuscles.includes('cuerpo_completo')
    ? FULL_BODY_GROUPS
    : selectedMuscles.length > 0
      ? selectedMuscles
      : ['pecho', 'espalda'];

  const desiredCount =
    totalExercises && totalExercises > 0
      ? totalExercises
      : Math.min(8, Math.max(4, targetGroups.length * 2));

  const sortedCompletedSessions = [...(workoutSessions || [])]
    .filter((s) => s.isCompleted)
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.date || 0).getTime() -
        new Date(a.completedAt || a.date || 0).getTime()
    );

  // Count how recently/frequently each exercise was performed
  const recencyScoreMap = new Map<string, number>();
  sortedCompletedSessions.forEach((session, idx) => {
    const recencyBoost = Math.max(1, 30 - idx * 3);
    (session.exercises || []).forEach((ex) => {
      const idKey = ex.exerciseId;
      const nameKey = ex.exerciseName.trim().toLowerCase();
      recencyScoreMap.set(idKey, (recencyScoreMap.get(idKey) || 0) + recencyBoost);
      recencyScoreMap.set(nameKey, (recencyScoreMap.get(nameKey) || 0) + recencyBoost);
    });
  });

  const excludedSet = new Set(excludeExerciseIds);

  // Bucket exercises by target focus/muscle group
  const buckets = new Map<ExerciseFocusFilter, ExerciseDefinition[]>();
  for (const group of targetGroups) {
    const matching = exercises.filter((ex) => {
      if (excludedSet.has(ex.id)) return false;
      if (!matchesExerciseFocus(ex, group)) return false;
      if (allowedEquipments) {
        const eq = ex.equipment ?? 'sin_equipo';
        if (!allowedEquipments.has(eq)) return false;
      }
      return true;
    });

    // Sort: exercises with recent history first, preserving catalog order for foundational movements
    const sorted = [...matching].sort((a, b) => {
      const scoreA =
        (recencyScoreMap.get(a.id) || 0) +
        (recencyScoreMap.get(a.name.trim().toLowerCase()) || 0);
      const scoreB =
        (recencyScoreMap.get(b.id) || 0) +
        (recencyScoreMap.get(b.name.trim().toLowerCase()) || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return 0;
    });

    if (variationSeed > 0 && sorted.length > 1) {
      const offset = variationSeed % sorted.length;
      buckets.set(
        group,
        offset > 0 ? [...sorted.slice(offset), ...sorted.slice(0, offset)] : sorted
      );
    } else {
      buckets.set(group, sorted);
    }
  }

  // Round-robin pick across selected muscle groups for a balanced routine
  const picked: ExerciseDefinition[] = [];
  const pickedIds = new Set<string>();
  const groupIndices = new Map<ExerciseFocusFilter, number>();
  let progress = true;

  while (picked.length < desiredCount && progress) {
    progress = false;
    for (const group of targetGroups) {
      if (picked.length >= desiredCount) break;
      const list = buckets.get(group) || [];
      let idx = groupIndices.get(group) || 0;
      while (idx < list.length && pickedIds.has(list[idx].id)) {
        idx++;
      }
      if (idx < list.length) {
        const candidate = list[idx];
        picked.push(candidate);
        pickedIds.add(candidate.id);
        groupIndices.set(group, idx + 1);
        progress = true;
      } else {
        groupIndices.set(group, idx);
      }
    }
  }

  const nowTs = Date.now();
  const items: RecommendedExerciseMeta[] = picked.map((ex, idx) => {
    const perf = findLastPerformanceForExercise(ex, sortedCompletedSessions, routines);
    const setsConfig: RoutineSetTarget[] = [];

    for (let i = 0; i < perf.setsCount; i++) {
      const setWeight =
        ex.defaultMode === 'weight_reps'
          ? perf.perSetWeights?.[i] ?? perf.weightKg
          : undefined;
      const setReps =
        ex.defaultMode !== 'duration'
          ? perf.perSetReps?.[i] ?? perf.reps ?? 10
          : undefined;
      const setDuration =
        ex.defaultMode === 'duration'
          ? perf.perSetDurations?.[i] ?? perf.durationSeconds ?? 45
          : undefined;

      setsConfig.push({
        setNumber: i + 1,
        targetWeightKg: setWeight,
        targetReps: setReps,
        targetDurationSeconds: setDuration,
      });
    }

    const firstSet = setsConfig[0];
    const config: RoutineExerciseConfig = {
      id: `cfg-rec-${nowTs}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      mode: ex.defaultMode,
      targetSets: setsConfig.length,
      targetReps: firstSet?.targetReps,
      targetWeightKg: firstSet?.targetWeightKg,
      targetDurationSeconds: firstSet?.targetDurationSeconds,
      restSeconds: 60,
      gifUrl: ex.gifUrl,
      setsConfig,
    };

    return {
      config,
      muscleGroup: ex.muscleGroup,
      source: perf.source,
      lastSessionDate: perf.lastSessionDate,
    };
  });

  const groupNames = selectedMuscles.map((m) => MUSCLE_GROUP_LABELS[m]);
  const suggestedName =
    groupNames.length === 0
      ? 'Rutina Recomendada'
      : groupNames.length === 1
        ? `Recomendada: ${groupNames[0]}`
        : groupNames.length === 2
          ? `Recomendada: ${groupNames[0]} y ${groupNames[1]}`
          : `Recomendada: ${groupNames.slice(0, 2).join(', ')} +${groupNames.length - 2}`;

  const historyCount = items.filter((i) => i.source === 'history').length;
  const suggestedDescription =
    historyCount > 0
      ? `Rutina generada automáticamente con pesos sugeridos según tus últimos entrenamientos (${historyCount}/${items.length} con historial).`
      : 'Rutina generada automáticamente con ejercicios balanceados para los grupos seleccionados.';

  return {
    suggestedName,
    suggestedDescription,
    items,
  };
}
