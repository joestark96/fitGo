import {
  WorkoutSession,
  FoodEntry,
  WeightRecord,
  DailyActivity,
  ExerciseDefinition,
  UserProfile,
  MuscleGroup,
} from '../types';
import { getLocalDateString } from './storage';

export interface RankInfo {
  title: string;
  minLevel: number;
  icon: string;
  color: string;
  gradient: string;
}

export interface TonnageMilestone {
  id: string;
  title: string;
  icon: string;
  targetKg: number;
  description: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'workout' | 'streak' | 'volume' | 'nutrition' | 'body';
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface PersonalRecordItem {
  exerciseId: string;
  exerciseName: string;
  newMaxWeightKg: number;
  previousMaxWeightKg: number;
  repsAtMax: number;
  isFirstTime: boolean;
}

export interface GamificationState {
  // Pillar 1: Streaks & Shields
  workoutStreakDays: number;
  nutritionStreakDays: number;
  activeStreakDays: number; // Combined daily habit streak (workout or nutrition + shields)
  shieldsAvailable: number;
  shieldsUsedInStreak: number;
  workedOutToday: boolean;
  loggedFoodToday: boolean;

  // Pillar 2: Levels, XP & Ranks
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
  rank: RankInfo;
  nextRank: RankInfo | null;

  // Pillar 3: Badges & Epic Tonnage
  totalVolumeKg: number;
  currentTonnageMilestone: TonnageMilestone | null;
  nextTonnageMilestone: TonnageMilestone;
  tonnageProgressPercent: number;
  allMilestones: (TonnageMilestone & { unlocked: boolean })[];
  achievements: AchievementBadge[];
  unlockedAchievementsCount: number;

  // Pillar 4: Daily Missions & Weekly Challenges
  dailyMissions: DailyMission[];
  weeklyChallenges: WeeklyChallenge[];
  completedDailyMissionsCount: number;

  // Summary stats
  totalWorkoutsCompleted: number;
  totalSetsCompleted: number;
  totalPRsCount: number;
  weeklyMuscleGroupsTrained: MuscleGroup[];
}

export const ATHLETE_RANKS: RankInfo[] = [
  {
    title: 'Novato Fit',
    minLevel: 1,
    icon: '🌱',
    color: '#94a3b8',
    gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
  },
  {
    title: 'Atleta Constante',
    minLevel: 4,
    icon: '🔥',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
  },
  {
    title: 'Guerrero de Hierro',
    minLevel: 8,
    icon: '⚔️',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  {
    title: 'Élite Espartano',
    minLevel: 15,
    icon: '🛡️',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
  },
  {
    title: 'Maestro Olímpico',
    minLevel: 25,
    icon: '👑',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
  },
  {
    title: 'Titán Legendario',
    minLevel: 40,
    icon: '⚡',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  },
];

export const TONNAGE_MILESTONES: TonnageMilestone[] = [
  {
    id: 'grizzly',
    title: 'Oso Grizzly',
    icon: '🐻',
    targetKg: 500,
    description: 'Has levantado el equivalente a un Oso Grizzly adulto (500 kg).',
  },
  {
    id: 'sportscar',
    title: 'Auto Deportivo',
    icon: '🏎️',
    targetKg: 1500,
    description: 'Has movido el peso total de un superdeportivo (1,500 kg).',
  },
  {
    id: 'hippo',
    title: 'Hipopótamo Imperial',
    icon: '🦛',
    targetKg: 4000,
    description: 'Fuerza colosal: 4 toneladas acumuladas en tus entrenamientos.',
  },
  {
    id: 'trex',
    title: 'Tyrannosaurus Rex',
    icon: '🦖',
    targetKg: 7000,
    description: 'Has levantado el peso de un T-Rex adulto (7,000 kg).',
  },
  {
    id: 'bus',
    title: 'Autobús Urbano',
    icon: '🚌',
    targetKg: 15000,
    description: '15 toneladas de hierro movidas con disciplina.',
  },
  {
    id: 'jet',
    title: 'Avión Comercial',
    icon: '✈️',
    targetKg: 50000,
    description: '50 toneladas acumuladas: potencia de despegue.',
  },
  {
    id: 'whale',
    title: 'Ballena Azul',
    icon: '🐋',
    targetKg: 100000,
    description: '100 toneladas: el ser más imponente del planeta.',
  },
];

export function normalizeDateStr(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateSessionVolumeKg(session: WorkoutSession): number {
  let vol = 0;
  for (const ex of session.exercises || []) {
    for (const s of ex.sets || []) {
      if (s.completed && s.actualReps && s.actualWeightKg && s.actualWeightKg > 0) {
        vol += s.actualReps * s.actualWeightKg;
      }
    }
  }
  return Math.round(vol);
}

export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
} {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(totalXp));
  let neededForNext = 250;

  while (remainingXp >= neededForNext) {
    remainingXp -= neededForNext;
    level++;
    neededForNext = 250 + (level - 1) * 100;
  }

  const levelProgressPercent = Math.min(100, Math.round((remainingXp / neededForNext) * 100));
  return {
    level,
    currentLevelXp: remainingXp,
    nextLevelXp: neededForNext,
    levelProgressPercent,
  };
}

export function getRankForLevel(level: number): { rank: RankInfo; nextRank: RankInfo | null } {
  let currentRank = ATHLETE_RANKS[0];
  let nextRank: RankInfo | null = null;

  for (let i = 0; i < ATHLETE_RANKS.length; i++) {
    if (level >= ATHLETE_RANKS[i].minLevel) {
      currentRank = ATHLETE_RANKS[i];
      nextRank = ATHLETE_RANKS[i + 1] || null;
    }
  }

  return { rank: currentRank, nextRank };
}

export function detectSessionPRs(
  currentSession: WorkoutSession,
  allSessions: WorkoutSession[]
): PersonalRecordItem[] {
  const previousSessions = allSessions.filter(
    (s) => s.id !== currentSession.id && s.isCompleted
  );

  const prevMaxMap = new Map<string, number>();
  for (const sess of previousSessions) {
    for (const ex of sess.exercises || []) {
      const key = (ex.exerciseId || ex.exerciseName || '').trim().toLowerCase();
      if (!key) continue;
      for (const st of ex.sets || []) {
        if (st.completed && st.actualWeightKg && st.actualWeightKg > 0) {
          const prev = prevMaxMap.get(key) || 0;
          if (st.actualWeightKg > prev) {
            prevMaxMap.set(key, st.actualWeightKg);
          }
        }
      }
    }
  }

  const prs: PersonalRecordItem[] = [];

  for (const ex of currentSession.exercises || []) {
    const key = (ex.exerciseId || ex.exerciseName || '').trim().toLowerCase();
    if (!key) continue;

    let sessionMaxWeight = 0;
    let repsAtMax = 0;
    for (const st of ex.sets || []) {
      if (st.completed && st.actualWeightKg && st.actualWeightKg > 0) {
        if (st.actualWeightKg > sessionMaxWeight) {
          sessionMaxWeight = st.actualWeightKg;
          repsAtMax = st.actualReps || 1;
        }
      }
    }

    if (sessionMaxWeight > 0) {
      const previousMax = prevMaxMap.get(key) || 0;
      if (sessionMaxWeight > previousMax) {
        prs.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          newMaxWeightKg: sessionMaxWeight,
          previousMaxWeightKg: previousMax,
          repsAtMax,
          isFirstTime: previousMax === 0,
        });
      }
    }
  }

  return prs;
}

export function calculateSessionEarnedXp(
  session: WorkoutSession,
  prsCount: number
): { baseXp: number; setsXp: number; prsXp: number; totalSessionXp: number } {
  const baseXp = 100;
  const completedSets = (session.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets || []).filter((s) => s.completed).length,
    0
  );
  const setsXp = completedSets * 15;
  const prsXp = prsCount * 50;
  return {
    baseXp,
    setsXp,
    prsXp,
    totalSessionXp: baseXp + setsXp + prsXp,
  };
}

export function computeGamificationState(params: {
  workoutSessions: WorkoutSession[];
  foodEntries: FoodEntry[];
  weightRecords: WeightRecord[];
  dailyActivities: DailyActivity[];
  exercises: ExerciseDefinition[];
  profile: UserProfile | null;
  todayDateStr?: string;
}): GamificationState {
  const {
    workoutSessions,
    foodEntries,
    weightRecords,
    dailyActivities,
    exercises,
    profile,
    todayDateStr = getLocalDateString(),
  } = params;

  const completedSessions = workoutSessions.filter((s) => s.isCompleted);

  const workoutDates = new Set<string>();
  let totalVolumeKg = 0;
  let totalSetsCompleted = 0;

  for (const sess of completedSessions) {
    const dStr = normalizeDateStr(sess.date);
    if (dStr) workoutDates.add(dStr);
    totalVolumeKg += calculateSessionVolumeKg(sess);
    for (const ex of sess.exercises || []) {
      for (const st of ex.sets || []) {
        if (st.completed) totalSetsCompleted++;
      }
    }
  }

  const foodDates = new Set<string>();
  let todayMealsCount = 0;
  for (const entry of foodEntries) {
    const dStr = normalizeDateStr(entry.date);
    if (dStr) foodDates.add(dStr);
    if (dStr === todayDateStr) todayMealsCount++;
  }

  const weightDates = new Set<string>();
  for (const wr of weightRecords) {
    const dStr = normalizeDateStr(wr.date);
    if (dStr) weightDates.add(dStr);
  }

  const workedOutToday = workoutDates.has(todayDateStr);
  const loggedFoodToday = foodDates.has(todayDateStr);
  const loggedWeightToday = weightDates.has(todayDateStr);

  const todayActivity = dailyActivities.find((a) => normalizeDateStr(a.date) === todayDateStr);
  const todaySteps = todayActivity?.steps || 0;

  const earnedShieldsTotal = Math.min(3, Math.floor(completedSessions.length / 3));

  let nutritionStreakDays = 0;
  let checkDay = loggedFoodToday ? todayDateStr : subtractDays(todayDateStr, 1);
  while (foodDates.has(checkDay)) {
    nutritionStreakDays++;
    checkDay = subtractDays(checkDay, 1);
  }

  let activeStreakDays = 0;
  let shieldsRemaining = earnedShieldsTotal;
  let shieldsUsedInStreak = 0;

  const isDayActive = (d: string) => workoutDates.has(d) || foodDates.has(d);
  let cursorDate = isDayActive(todayDateStr) ? todayDateStr : subtractDays(todayDateStr, 1);

  while (true) {
    if (isDayActive(cursorDate)) {
      activeStreakDays++;
      cursorDate = subtractDays(cursorDate, 1);
    } else if (shieldsRemaining > 0) {
      const prevDate = subtractDays(cursorDate, 1);
      if (isDayActive(prevDate)) {
        shieldsRemaining--;
        shieldsUsedInStreak++;
        activeStreakDays++;
        cursorDate = prevDate;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let workoutStreakDays = 0;
  let wCursor = workedOutToday ? todayDateStr : subtractDays(todayDateStr, 1);
  let restGapAllowed = 1;
  while (true) {
    if (workoutDates.has(wCursor)) {
      workoutStreakDays++;
      restGapAllowed = 1;
      wCursor = subtractDays(wCursor, 1);
    } else if (restGapAllowed > 0 && workoutDates.has(subtractDays(wCursor, 1))) {
      restGapAllowed--;
      wCursor = subtractDays(wCursor, 1);
    } else {
      break;
    }
  }

  const last7Days = new Set<string>();
  for (let i = 0; i < 7; i++) {
    last7Days.add(subtractDays(todayDateStr, i));
  }

  const exerciseCatalogMap = new Map<string, MuscleGroup>();
  for (const ex of exercises) {
    exerciseCatalogMap.set(ex.id.toLowerCase(), ex.muscleGroup);
    exerciseCatalogMap.set(ex.name.toLowerCase(), ex.muscleGroup);
  }

  const weeklyMuscleGroupsSet = new Set<MuscleGroup>();
  let weeklyWorkoutsCount = 0;

  for (const sess of completedSessions) {
    const dStr = normalizeDateStr(sess.date);
    if (last7Days.has(dStr)) {
      weeklyWorkoutsCount++;
      for (const ex of sess.exercises || []) {
        const hasDoneSet = (ex.sets || []).some((s) => s.completed);
        if (!hasDoneSet) continue;
        const mg =
          exerciseCatalogMap.get((ex.exerciseId || '').toLowerCase()) ||
          exerciseCatalogMap.get((ex.exerciseName || '').toLowerCase());
        if (mg && mg !== 'cardio' && mg !== 'cuerpo_completo') {
          weeklyMuscleGroupsSet.add(mg);
        } else if (mg === 'cuerpo_completo') {
          weeklyMuscleGroupsSet.add('pecho');
          weeklyMuscleGroupsSet.add('espalda');
          weeklyMuscleGroupsSet.add('piernas');
        }
      }
    }
  }
  const weeklyMuscleGroupsTrained = Array.from(weeklyMuscleGroupsSet);

  const chronologicalSessions = [...completedSessions].sort((a, b) =>
    normalizeDateStr(a.date).localeCompare(normalizeDateStr(b.date))
  );
  const runningMaxMap = new Map<string, number>();
  let totalPRsCount = 0;

  for (const sess of chronologicalSessions) {
    for (const ex of sess.exercises || []) {
      const key = (ex.exerciseId || ex.exerciseName || '').trim().toLowerCase();
      if (!key) continue;
      let maxInSess = 0;
      for (const st of ex.sets || []) {
        if (st.completed && st.actualWeightKg && st.actualWeightKg > maxInSess) {
          maxInSess = st.actualWeightKg;
        }
      }
      if (maxInSess > 0) {
        const prevMax = runningMaxMap.get(key) || 0;
        if (maxInSess > prevMax) {
          runningMaxMap.set(key, maxInSess);
          totalPRsCount++;
        }
      }
    }
  }

  const latestWeight = weightRecords.length > 0 ? weightRecords[0].weightKg : undefined;
  const targetWeight = profile?.targetWeight;
  const reachedTargetWeight =
    latestWeight !== undefined &&
    targetWeight !== undefined &&
    Math.abs(latestWeight - targetWeight) <= 0.5;

  const achievements: AchievementBadge[] = [
    {
      id: 'first_workout',
      title: 'Primer Paso',
      description: 'Completa tu primera sesión de entrenamiento.',
      icon: '🏋️',
      xpReward: 100,
      unlocked: completedSessions.length >= 1,
      progress: Math.min(1, completedSessions.length),
      maxProgress: 1,
      category: 'workout',
    },
    {
      id: 'workouts_10',
      title: 'Dedicación de Acero',
      description: 'Completa 10 sesiones de entrenamiento.',
      icon: '💪',
      xpReward: 250,
      unlocked: completedSessions.length >= 10,
      progress: Math.min(10, completedSessions.length),
      maxProgress: 10,
      category: 'workout',
    },
    {
      id: 'workouts_50',
      title: 'Centurión del Gym',
      description: 'Completa 50 sesiones de entrenamiento.',
      icon: '🏛️',
      xpReward: 600,
      unlocked: completedSessions.length >= 50,
      progress: Math.min(50, completedSessions.length),
      maxProgress: 50,
      category: 'workout',
    },
    {
      id: 'streak_3',
      title: 'En Llamas',
      description: 'Mantén una racha activa de 3 días seguidos.',
      icon: '🔥',
      xpReward: 150,
      unlocked: activeStreakDays >= 3,
      progress: Math.min(3, activeStreakDays),
      maxProgress: 3,
      category: 'streak',
    },
    {
      id: 'streak_7',
      title: 'Imparable',
      description: 'Alcanza una racha activa de 7 días consecutivos.',
      icon: '⚡',
      xpReward: 350,
      unlocked: activeStreakDays >= 7,
      progress: Math.min(7, activeStreakDays),
      maxProgress: 7,
      category: 'streak',
    },
    {
      id: 'vol_500',
      title: 'Fuerza de Oso Grizzly',
      description: 'Levanta 500 kg de volumen total acumulado.',
      icon: '🐻',
      xpReward: 150,
      unlocked: totalVolumeKg >= 500,
      progress: Math.min(500, totalVolumeKg),
      maxProgress: 500,
      category: 'volume',
    },
    {
      id: 'vol_7000',
      title: 'Domador de T-Rex',
      description: 'Levanta 7,000 kg de volumen total acumulado.',
      icon: '🦖',
      xpReward: 400,
      unlocked: totalVolumeKg >= 7000,
      progress: Math.min(7000, totalVolumeKg),
      maxProgress: 7000,
      category: 'volume',
    },
    {
      id: 'vol_25000',
      title: 'Hércules Moderno',
      description: 'Acumula 25,000 kg de volumen total.',
      icon: '🏆',
      xpReward: 750,
      unlocked: totalVolumeKg >= 25000,
      progress: Math.min(25000, totalVolumeKg),
      maxProgress: 25000,
      category: 'volume',
    },
    {
      id: 'nutrition_10',
      title: 'Nutrición Consciente',
      description: 'Registra 10 alimentos en tu diario de calorías.',
      icon: '🥗',
      xpReward: 150,
      unlocked: foodEntries.length >= 10,
      progress: Math.min(10, foodEntries.length),
      maxProgress: 10,
      category: 'nutrition',
    },
    {
      id: 'nutrition_50',
      title: 'Chef Fitness',
      description: 'Registra 50 alimentos en tu bitácora nutricional.',
      icon: '🍱',
      xpReward: 400,
      unlocked: foodEntries.length >= 50,
      progress: Math.min(50, foodEntries.length),
      maxProgress: 50,
      category: 'nutrition',
    },
    {
      id: 'weight_5',
      title: 'Control Corporal',
      description: 'Realiza 5 registros de seguimiento de peso e IMC.',
      icon: '⚖️',
      xpReward: 150,
      unlocked: weightRecords.length >= 5,
      progress: Math.min(5, weightRecords.length),
      maxProgress: 5,
      category: 'body',
    },
    {
      id: 'balanced_week',
      title: 'Cuerpo Equilibrado',
      description: 'Entrena 4 o más grupos musculares distintos en los últimos 7 días.',
      icon: '🧬',
      xpReward: 300,
      unlocked: weeklyMuscleGroupsTrained.length >= 4,
      progress: Math.min(4, weeklyMuscleGroupsTrained.length),
      maxProgress: 4,
      category: 'workout',
    },
    {
      id: 'goal_weight',
      title: 'Meta Cumplida',
      description: 'Alcanza tu peso objetivo configurado en tu perfil (±0.5 kg).',
      icon: '🎯',
      xpReward: 500,
      unlocked: reachedTargetWeight,
      progress: reachedTargetWeight ? 1 : 0,
      maxProgress: 1,
      category: 'body',
    },
  ];

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const allMilestones = TONNAGE_MILESTONES.map((m) => ({
    ...m,
    unlocked: totalVolumeKg >= m.targetKg,
  }));

  let currentTonnageMilestone: TonnageMilestone | null = null;
  let nextTonnageMilestone: TonnageMilestone = TONNAGE_MILESTONES[0];

  for (let i = 0; i < TONNAGE_MILESTONES.length; i++) {
    if (totalVolumeKg >= TONNAGE_MILESTONES[i].targetKg) {
      currentTonnageMilestone = TONNAGE_MILESTONES[i];
      nextTonnageMilestone =
        TONNAGE_MILESTONES[i + 1] || TONNAGE_MILESTONES[TONNAGE_MILESTONES.length - 1];
    } else {
      nextTonnageMilestone = TONNAGE_MILESTONES[i];
      break;
    }
  }

  const prevTarget = currentTonnageMilestone ? currentTonnageMilestone.targetKg : 0;
  const span = Math.max(1, nextTonnageMilestone.targetKg - prevTarget);
  const tonnageProgressPercent =
    totalVolumeKg >= nextTonnageMilestone.targetKg
      ? 100
      : Math.min(100, Math.max(0, Math.round(((totalVolumeKg - prevTarget) / span) * 100)));

  const dailyMissions: DailyMission[] = [
    {
      id: 'daily_workout',
      title: 'Entrenamiento del Día',
      description: 'Completa al menos 1 sesión de entrenamiento hoy.',
      icon: '🏋️‍♂️',
      xpReward: 100,
      completed: workedOutToday,
      progress: workedOutToday ? 1 : 0,
      maxProgress: 1,
    },
    {
      id: 'daily_nutrition',
      title: 'Bitácora Nutricional',
      description: 'Registra al menos 2 comidas o snacks hoy.',
      icon: '🍎',
      xpReward: 50,
      completed: todayMealsCount >= 2,
      progress: Math.min(2, todayMealsCount),
      maxProgress: 2,
    },
    {
      id: 'daily_body_or_steps',
      title: 'Chequeo o Movimiento',
      description: 'Registra tu peso hoy o alcanza 5,000 pasos.',
      icon: '👟',
      xpReward: 50,
      completed: loggedWeightToday || todaySteps >= 5000,
      progress: loggedWeightToday ? 1 : Math.min(1, Number((todaySteps / 5000).toFixed(2))),
      maxProgress: 1,
    },
  ];

  const completedDailyMissionsCount = dailyMissions.filter((m) => m.completed).length;

  const weeklyChallenges: WeeklyChallenge[] = [
    {
      id: 'weekly_3_workouts',
      title: 'Trío de Hierro Semanal',
      description: 'Completa 3 entrenamientos en los últimos 7 días.',
      icon: '🔥',
      xpReward: 250,
      completed: weeklyWorkoutsCount >= 3,
      progress: Math.min(3, weeklyWorkoutsCount),
      maxProgress: 3,
    },
    {
      id: 'weekly_muscle_heatmap',
      title: 'Mapa Muscular Simétrico',
      description: 'Activa al menos 4 grupos musculares distintos esta semana.',
      icon: '🧬',
      xpReward: 300,
      completed: weeklyMuscleGroupsTrained.length >= 4,
      progress: Math.min(4, weeklyMuscleGroupsTrained.length),
      maxProgress: 4,
    },
  ];

  const workoutsXp = completedSessions.length * 100;
  const setsXp = totalSetsCompleted * 15;
  const prsXp = totalPRsCount * 50;
  const nutritionDaysXp = foodDates.size * 30;
  const mealsXp = foodEntries.length * 10;
  const weightXp = weightRecords.length * 25;
  const achievementsXp = achievements
    .filter((a) => a.unlocked)
    .reduce((acc, a) => acc + a.xpReward, 0);
  const dailyBonusXp = dailyMissions
    .filter((m) => m.completed)
    .reduce((acc, m) => acc + m.xpReward, 0);

  const totalXp =
    workoutsXp +
    setsXp +
    prsXp +
    nutritionDaysXp +
    mealsXp +
    weightXp +
    achievementsXp +
    dailyBonusXp;

  const { level, currentLevelXp, nextLevelXp, levelProgressPercent } =
    calculateLevelFromXp(totalXp);
  const { rank, nextRank } = getRankForLevel(level);

  return {
    workoutStreakDays,
    nutritionStreakDays,
    activeStreakDays,
    shieldsAvailable: shieldsRemaining,
    shieldsUsedInStreak,
    workedOutToday,
    loggedFoodToday,
    totalXp,
    level,
    currentLevelXp,
    nextLevelXp,
    levelProgressPercent,
    rank,
    nextRank,
    totalVolumeKg,
    currentTonnageMilestone,
    nextTonnageMilestone,
    tonnageProgressPercent,
    allMilestones,
    achievements,
    unlockedAchievementsCount,
    dailyMissions,
    weeklyChallenges,
    completedDailyMissionsCount,
    totalWorkoutsCompleted: completedSessions.length,
    totalSetsCompleted,
    totalPRsCount,
    weeklyMuscleGroupsTrained,
  };
}
