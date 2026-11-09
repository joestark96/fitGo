import { describe, it, expect } from 'vitest';
import {
  calculateLevelFromXp,
  getRankForLevel,
  detectSessionPRs,
  computeGamificationState,
} from './gamificationService';
import { WorkoutSession } from '../types';

describe('gamificationService', () => {
  it('calculates RPG levels and progress accurately from total XP', () => {
    const lv1 = calculateLevelFromXp(0);
    expect(lv1.level).toBe(1);
    expect(lv1.currentLevelXp).toBe(0);
    expect(lv1.nextLevelXp).toBe(250);

    const lv2 = calculateLevelFromXp(250);
    expect(lv2.level).toBe(2);
    expect(lv2.currentLevelXp).toBe(0);
    expect(lv2.nextLevelXp).toBe(350);

    const midLv2 = calculateLevelFromXp(425);
    expect(midLv2.level).toBe(2);
    expect(midLv2.currentLevelXp).toBe(175);
    expect(midLv2.levelProgressPercent).toBe(50);
  });

  it('maps levels to Athlete Ranks properly', () => {
    expect(getRankForLevel(1).rank.title).toBe('Novato Fit');
    expect(getRankForLevel(4).rank.title).toBe('Atleta Constante');
    expect(getRankForLevel(8).rank.title).toBe('Guerrero de Hierro');
    expect(getRankForLevel(15).rank.title).toBe('Élite Espartano');
    expect(getRankForLevel(25).rank.title).toBe('Maestro Olímpico');
    expect(getRankForLevel(45).rank.title).toBe('Titán Legendario');
    expect(getRankForLevel(45).nextRank).toBeNull();
  });

  it('detects Personal Records (PRs) when lifting heavier weight than previous sessions', () => {
    const oldSession: WorkoutSession = {
      id: 'sess-1',
      routineId: 'r-1',
      routineName: 'Empuje',
      date: '2026-11-01',
      startedAt: '2026-11-01T10:00:00Z',
      isCompleted: true,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Press de Banca',
          mode: 'weight_reps',
          sets: [{ setNumber: 1, completed: true, actualWeightKg: 60, actualReps: 10 }],
        },
      ],
    };

    const currentSession: WorkoutSession = {
      id: 'sess-2',
      routineId: 'r-1',
      routineName: 'Empuje',
      date: '2026-11-08',
      startedAt: '2026-11-08T10:00:00Z',
      isCompleted: true,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Press de Banca',
          mode: 'weight_reps',
          sets: [{ setNumber: 1, completed: true, actualWeightKg: 70, actualReps: 8 }],
        },
      ],
    };

    const prs = detectSessionPRs(currentSession, [oldSession, currentSession]);
    expect(prs).toHaveLength(1);
    expect(prs[0].exerciseName).toBe('Press de Banca');
    expect(prs[0].newMaxWeightKg).toBe(70);
    expect(prs[0].previousMaxWeightKg).toBe(60);
    expect(prs[0].isFirstTime).toBe(false);
  });

  it('computes streaks, shields, tonnage milestones, and daily missions', () => {
    const sessions: WorkoutSession[] = [
      {
        id: 's1',
        routineId: 'r1',
        routineName: 'Full Body',
        date: '2026-11-06',
        startedAt: '2026-11-06T10:00:00Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'sq',
            exerciseName: 'Sentadilla',
            mode: 'weight_reps',
            sets: [{ setNumber: 1, completed: true, actualWeightKg: 100, actualReps: 6 }],
          },
        ],
      },
      {
        id: 's2',
        routineId: 'r1',
        routineName: 'Full Body',
        date: '2026-11-08',
        startedAt: '2026-11-08T10:00:00Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'sq',
            exerciseName: 'Sentadilla',
            mode: 'weight_reps',
            sets: [{ setNumber: 1, completed: true, actualWeightKg: 110, actualReps: 6 }],
          },
        ],
      },
      {
        id: 's3',
        routineId: 'r1',
        routineName: 'Full Body',
        date: '2026-11-09',
        startedAt: '2026-11-09T10:00:00Z',
        isCompleted: true,
        exercises: [
          {
            exerciseId: 'sq',
            exerciseName: 'Sentadilla',
            mode: 'weight_reps',
            sets: [{ setNumber: 1, completed: true, actualWeightKg: 120, actualReps: 5 }],
          },
        ],
      },
    ];

    const state = computeGamificationState({
      workoutSessions: sessions,
      foodEntries: [],
      weightRecords: [],
      dailyActivities: [],
      exercises: [],
      profile: null,
      todayDateStr: '2026-11-09',
    });

    expect(state.totalVolumeKg).toBe(1860);
    expect(state.currentTonnageMilestone?.id).toBe('sportscar');
    expect(state.workedOutToday).toBe(true);
    expect(state.activeStreakDays).toBe(4);
    expect(state.completedDailyMissionsCount).toBeGreaterThanOrEqual(1);
    expect(state.unlockedAchievementsCount).toBeGreaterThanOrEqual(2);
  });

  it('starts a newly registered user at Level 1 with 0 XP despite onboarding initial weight record', () => {
    const state = computeGamificationState({
      workoutSessions: [],
      foodEntries: [],
      weightRecords: [
        {
          id: 'weight-init-1794241000000',
          date: '2026-11-09',
          weightKg: 70,
          heightCm: 175,
          bmi: 22.9,
          notes: 'Registro inicial de perfil',
          createdAt: '2026-11-09T10:00:00Z',
        },
      ],
      dailyActivities: [],
      exercises: [],
      profile: {
        name: 'Test User',
        birthDate: '1996-05-10',
        gender: 'male',
        height: 175,
        initialWeight: 70,
        targetWeight: 70,
        createdAt: '2026-11-09T10:00:00Z',
        updatedAt: '2026-11-09T10:00:00Z',
      },
      todayDateStr: '2026-11-09',
    });

    expect(state.level).toBe(1);
    expect(state.totalXp).toBe(0);
    expect(state.completedDailyMissionsCount).toBe(0);
    expect(state.unlockedAchievementsCount).toBe(0);
  });
});
