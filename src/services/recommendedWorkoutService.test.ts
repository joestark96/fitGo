import { describe, it, expect } from 'vitest';
import { generateRecommendedWorkout } from './recommendedWorkoutService';
import { ExerciseDefinition, WorkoutSession, Routine } from '../types';

const sampleExercises: ExerciseDefinition[] = [
  {
    id: 'ex-bench',
    name: 'Press de Banca Plano',
    muscleGroup: 'pecho',
    defaultMode: 'weight_reps',
    equipment: 'barra',
  },
  {
    id: 'ex-fly',
    name: 'Aperturas con Mancuernas',
    muscleGroup: 'pecho',
    defaultMode: 'weight_reps',
    equipment: 'mancuernas',
  },
  {
    id: 'ex-curl',
    name: 'Curl de Bíceps',
    muscleGroup: 'brazos',
    defaultMode: 'weight_reps',
    equipment: 'mancuernas',
  },
  {
    id: 'ex-triceps',
    name: 'Extensión de Tríceps en Polea',
    muscleGroup: 'brazos',
    defaultMode: 'weight_reps',
    equipment: 'polea',
  },
  {
    id: 'ex-squat',
    name: 'Sentadilla con Barra',
    muscleGroup: 'piernas',
    defaultMode: 'weight_reps',
    equipment: 'barra',
  },
  {
    id: 'ex-plank',
    name: 'Plancha Abdominal',
    muscleGroup: 'core',
    defaultMode: 'duration',
    equipment: 'sin_equipo',
  },
];

describe('generateRecommendedWorkout', () => {
  it('selects balanced exercises for selected muscle groups and uses weights from the latest completed session', () => {
    const sessions: WorkoutSession[] = [
      {
        id: 'old-session',
        routineId: 'r1',
        routineName: 'Pecho Viejo',
        date: '2026-10-01T10:00:00.000Z',
        startedAt: '2026-10-01T10:00:00.000Z',
        completedAt: '2026-10-01T11:00:00.000Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'ex-bench',
            exerciseName: 'Press de Banca Plano',
            mode: 'weight_reps',
            sets: [
              { setNumber: 1, completed: true, actualWeightKg: 40, actualReps: 10 },
              { setNumber: 2, completed: true, actualWeightKg: 40, actualReps: 10 },
            ],
          },
        ],
      },
      {
        id: 'latest-session',
        routineId: 'r1',
        routineName: 'Pecho y Brazos Reciente',
        date: '2026-11-10T10:00:00.000Z',
        startedAt: '2026-11-10T10:00:00.000Z',
        completedAt: '2026-11-10T11:00:00.000Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'ex-bench',
            exerciseName: 'Press de Banca Plano',
            mode: 'weight_reps',
            sets: [
              { setNumber: 1, completed: true, actualWeightKg: 50, actualReps: 10 },
              { setNumber: 2, completed: true, actualWeightKg: 55, actualReps: 8 },
              { setNumber: 3, completed: true, actualWeightKg: 55, actualReps: 8 },
              { setNumber: 4, completed: true, actualWeightKg: 50, actualReps: 10 },
            ],
          },
          {
            exerciseId: 'ex-curl',
            exerciseName: 'Curl de Bíceps',
            mode: 'weight_reps',
            sets: [
              { setNumber: 1, completed: true, actualWeightKg: 12.5, actualReps: 12 },
              { setNumber: 2, completed: true, actualWeightKg: 12.5, actualReps: 12 },
              { setNumber: 3, completed: true, actualWeightKg: 12.5, actualReps: 10 },
            ],
          },
        ],
      },
    ];

    const result = generateRecommendedWorkout({
      selectedMuscles: ['pecho', 'brazos'],
      exercises: sampleExercises,
      workoutSessions: sessions,
      totalExercises: 4,
    });

    expect(result.items).toHaveLength(4);
    expect(result.suggestedName).toContain('Pecho');
    expect(result.suggestedName).toContain('Brazos');

    const benchItem = result.items.find((i) => i.config.exerciseId === 'ex-bench');
    expect(benchItem).toBeDefined();
    expect(benchItem?.source).toBe('history');
    expect(benchItem?.config.targetSets).toBe(4);
    expect(benchItem?.config.setsConfig?.[0].targetWeightKg).toBe(50);
    expect(benchItem?.config.setsConfig?.[1].targetWeightKg).toBe(55);

    const curlItem = result.items.find((i) => i.config.exerciseId === 'ex-curl');
    expect(curlItem).toBeDefined();
    expect(curlItem?.source).toBe('history');
    expect(curlItem?.config.targetWeightKg).toBe(12.5);

    const flyItem = result.items.find((i) => i.config.exerciseId === 'ex-fly');
    expect(flyItem?.source).toBe('default');
    expect(flyItem?.config.targetWeightKg).toBe(10); // dumbbell default
  });

  it('falls back to existing routine targets when no workout session exists', () => {
    const routines: Routine[] = [
      {
        id: 'r-existing',
        name: 'Pierna',
        exercises: [
          {
            id: 'cfg-1',
            exerciseId: 'ex-squat',
            exerciseName: 'Sentadilla con Barra',
            mode: 'weight_reps',
            targetSets: 4,
            targetReps: 8,
            targetWeightKg: 75,
          },
        ],
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
      },
    ];

    const result = generateRecommendedWorkout({
      selectedMuscles: ['piernas'],
      exercises: sampleExercises,
      workoutSessions: [],
      routines,
      totalExercises: 2,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].source).toBe('routine');
    expect(result.items[0].config.targetWeightKg).toBe(75);
    expect(result.items[0].config.targetSets).toBe(4);
  });

  it('supports cuerpo_completo and equipment filtering', () => {
    const result = generateRecommendedWorkout({
      selectedMuscles: ['cuerpo_completo'],
      exercises: sampleExercises,
      workoutSessions: [],
      equipmentFilter: 'sin_equipo',
      totalExercises: 4,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].config.exerciseId).toBe('ex-plank');
    expect(result.items[0].config.mode).toBe('duration');
  });

  it('supports selecting multiple equipment types at once', () => {
    const result = generateRecommendedWorkout({
      selectedMuscles: ['cuerpo_completo'],
      exercises: sampleExercises,
      workoutSessions: [],
      equipmentFilter: ['mancuernas', 'sin_equipo'],
      totalExercises: 6,
    });

    const ids = result.items.map((i) => i.config.exerciseId);
    expect(ids).toContain('ex-fly');
    expect(ids).toContain('ex-curl');
    expect(ids).toContain('ex-plank');
    expect(ids).not.toContain('ex-bench'); // barra
    expect(ids).not.toContain('ex-squat'); // barra
    expect(ids).not.toContain('ex-row'); // polea
  });

  it('rotates exercises when variationSeed changes even with workout history', () => {
    const sessions: WorkoutSession[] = [
      {
        id: 'ws-1',
        routineId: 'r-1',
        routineName: 'Pecho',
        date: '2026-11-10',
        startedAt: '2026-11-10T10:00:00.000Z',
        completedAt: '2026-11-10T10:45:00.000Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'ex-bench',
            exerciseName: 'Press de Banca',
            mode: 'weight_reps',
            sets: [{ setNumber: 1, completed: true, actualWeightKg: 60, actualReps: 8 }],
          },
        ],
      },
    ];

    const first = generateRecommendedWorkout({
      selectedMuscles: ['pecho'],
      exercises: sampleExercises,
      workoutSessions: sessions,
      totalExercises: 1,
      variationSeed: 0,
    });

    const varied = generateRecommendedWorkout({
      selectedMuscles: ['pecho'],
      exercises: sampleExercises,
      workoutSessions: sessions,
      totalExercises: 1,
      variationSeed: 1,
    });

    expect(first.items[0].config.exerciseId).toBe('ex-bench');
    expect(varied.items[0].config.exerciseId).toBe('ex-fly');
  });

  it('supports gluteos, push, pull, tren_superior, and tren_inferior filters', () => {
    const extendedExercises: ExerciseDefinition[] = [
      ...sampleExercises,
      {
        id: 'ex-hip-thrust',
        name: 'Hip Thrust con Barra',
        muscleGroup: 'piernas',
        defaultMode: 'weight_reps',
        equipment: 'barra',
        description: 'Máxima activación de glúteos.',
      },
      {
        id: 'ex-row',
        name: 'Remo en Polea',
        muscleGroup: 'espalda',
        defaultMode: 'weight_reps',
        equipment: 'polea',
      },
    ];

    const glutes = generateRecommendedWorkout({
      selectedMuscles: ['gluteos'],
      exercises: extendedExercises,
      workoutSessions: [],
      totalExercises: 4,
    });
    expect(glutes.items.map((i) => i.config.exerciseId)).toEqual(['ex-hip-thrust']);

    const push = generateRecommendedWorkout({
      selectedMuscles: ['push'],
      exercises: extendedExercises,
      workoutSessions: [],
      totalExercises: 6,
    });
    const pushIds = push.items.map((i) => i.config.exerciseId);
    expect(pushIds).toContain('ex-bench');
    expect(pushIds).toContain('ex-triceps');
    expect(pushIds).not.toContain('ex-curl');
    expect(pushIds).not.toContain('ex-row');

    const pull = generateRecommendedWorkout({
      selectedMuscles: ['pull'],
      exercises: extendedExercises,
      workoutSessions: [],
      totalExercises: 6,
    });
    const pullIds = pull.items.map((i) => i.config.exerciseId);
    expect(pullIds).toContain('ex-row');
    expect(pullIds).toContain('ex-curl');
    expect(pullIds).not.toContain('ex-triceps');
    expect(pullIds).not.toContain('ex-bench');

    const upper = generateRecommendedWorkout({
      selectedMuscles: ['tren_superior'],
      exercises: extendedExercises,
      workoutSessions: [],
      totalExercises: 8,
    });
    expect(upper.items.every((i) => i.muscleGroup !== 'piernas' && i.muscleGroup !== 'core')).toBe(true);

    const lower = generateRecommendedWorkout({
      selectedMuscles: ['tren_inferior'],
      exercises: extendedExercises,
      workoutSessions: [],
      totalExercises: 8,
    });
    expect(lower.items.every((i) => i.muscleGroup === 'piernas')).toBe(true);
  });
});
