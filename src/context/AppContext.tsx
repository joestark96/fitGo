import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import {
  UserProfile,
  Routine,
  ExerciseDefinition,
  WeightRecord,
  WorkoutSession,
  WorkoutExerciseResult,
  WorkoutSetResult,
  FoodEntry,
  ActivityLevel,
  CalorieRecommendation,
  RoutineExerciseConfig,
  DailyActivity,
} from '../types';
import { StorageService, calculateBmi, calculateCalorieRecommendation, getLocalDateString } from '../services/storage';
import { notificationService } from '../services/notificationService';

interface AppContextType {
  profile: UserProfile | null;
  hasProfile: boolean;
  routines: Routine[];
  exercises: ExerciseDefinition[];
  weightRecords: WeightRecord[];
  workoutSessions: WorkoutSession[];
  activeWorkout: WorkoutSession | null;
  foodEntries: FoodEntry[];
  dailyActivities: DailyActivity[];
  activityLevel: ActivityLevel;
  calorieRecommendation: CalorieRecommendation;
  saveProfile: (profile: UserProfile) => void;
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  saveExercise: (exercise: ExerciseDefinition) => void;
  saveWeightRecord: (record: WeightRecord) => void;
  deleteWeightRecord: (id: string) => void;
  saveFoodEntry: (entry: FoodEntry) => void;
  deleteFoodEntry: (id: string) => void;
  saveDailyActivity: (activity: DailyActivity) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  startWorkout: (routine: Routine) => WorkoutSession;
  updateWorkoutSession: (session: WorkoutSession) => void;
  deleteWorkoutSession: (sessionId: string) => void;
  toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;
  updateSetValues: (
    exerciseIndex: number,
    setIndex: number,
    values: Partial<WorkoutSetResult>
  ) => void;
  addExerciseToActiveWorkout: (exercise: ExerciseDefinition) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  reorderExerciseInActiveWorkout: (fromIndex: number, toIndex: number) => void;
  addSetToActiveWorkout: (exerciseIndex: number) => void;
  removeSetFromActiveWorkout: (exerciseIndex: number, setIndex?: number) => void;
  finishActiveWorkout: (
    notes?: string,
    syncToRoutine?: boolean,
    caloriesBurned?: number,
    steps?: number
  ) => WorkoutSession | null;
  cancelActiveWorkout: () => void;
  refreshData: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [activityLevel, setActivityLevelState] = useState<ActivityLevel>('light');

  const activeWorkoutRef = useRef<WorkoutSession | null>(null);
  activeWorkoutRef.current = activeWorkout;

  const refreshData = () => {
    const prof = StorageService.getUserProfile();
    const hasProf = StorageService.hasUserProfile();
    setProfile(prof);
    setHasProfile(hasProf);

    setRoutines(StorageService.getRoutines());
    setExercises(StorageService.getExercises());
    setWeightRecords(StorageService.getWeightRecords());
    setWorkoutSessions(StorageService.getWorkoutSessions());
    setFoodEntries(StorageService.getFoodEntries());
    setDailyActivities(StorageService.getDailyActivities());
    setActivityLevelState(StorageService.getActivityLevel());
    const savedActive = StorageService.getActiveWorkout();
    if (savedActive) {
      setActiveWorkout(savedActive);
      notificationService.scheduleWorkoutReminders(savedActive);
    }
  };

  useEffect(() => {
    refreshData();

    // Listen for app going into background to ensure workout notifications are scheduled
    let listenerHandle: any = null;
    try {
      CapApp.addListener('appStateChange', (state) => {
        if (!state.isActive && activeWorkoutRef.current) {
          notificationService.scheduleWorkoutReminders(activeWorkoutRef.current);
        }
      }).then((handle) => {
        listenerHandle = handle;
      });
    } catch {
      // Ignored in non-native environments
    }

    return () => {
      if (listenerHandle?.remove) {
        listenerHandle.remove();
      }
    };
  }, []);

  const latestWeight = weightRecords.length > 0 ? weightRecords[0].weightKg : (profile?.initialWeight ?? profile?.targetWeight);

  const calorieRecommendation = useMemo(() => {
    return calculateCalorieRecommendation(profile, latestWeight, activityLevel);
  }, [profile, latestWeight, activityLevel]);

  const handleSetActivityLevel = (level: ActivityLevel) => {
    StorageService.saveActivityLevel(level);
    setActivityLevelState(level);
  };

  const handleSaveFoodEntry = (entry: FoodEntry) => {
    const updated = StorageService.saveFoodEntry(entry);
    setFoodEntries(updated);
  };

  const handleDeleteFoodEntry = (id: string) => {
    const updated = StorageService.deleteFoodEntry(id);
    setFoodEntries(updated);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    StorageService.saveUserProfile(newProfile);
    setProfile(newProfile);
    setHasProfile(true);

    // If there are no weight records yet, create the first one using profile's initial weight if present
    const records = StorageService.getWeightRecords();
    if (records.length === 0 && newProfile.targetWeight) {
      const initialRecord: WeightRecord = {
        id: 'weight-init-' + Date.now(),
        date: getLocalDateString(),
        weightKg: newProfile.targetWeight,
        heightCm: newProfile.height,
        bmi: calculateBmi(newProfile.targetWeight, newProfile.height),
        notes: 'Registro inicial de perfil',
        createdAt: new Date().toISOString(),
      };
      StorageService.saveWeightRecord(initialRecord);
      setWeightRecords([initialRecord]);
    }
  };

  const handleSaveRoutine = (routine: Routine) => {
    const updated = StorageService.saveRoutine(routine);
    setRoutines(updated);
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = StorageService.deleteRoutine(id);
    setRoutines(updated);
    if (activeWorkout && activeWorkout.routineId === id) {
      setActiveWorkout(null);
      notificationService.cancelWorkoutReminders();
    }
  };

  const handleSaveExercise = (exercise: ExerciseDefinition) => {
    const updated = StorageService.saveExercise(exercise);
    setExercises(updated);
  };

  const handleSaveWeightRecord = (record: WeightRecord) => {
    const updated = StorageService.saveWeightRecord(record);
    setWeightRecords(updated);
  };

  const handleDeleteWeightRecord = (id: string) => {
    const updated = StorageService.deleteWeightRecord(id);
    setWeightRecords(updated);
  };

  const startWorkout = (routine: Routine): WorkoutSession => {
    const routineExercises = routine?.exercises || [];
    const workoutExercises: WorkoutExerciseResult[] = routineExercises.map((item, idx) => {
      const sets: WorkoutSetResult[] = [];
      const totalSets = item.targetSets && item.targetSets > 0 ? item.targetSets : 3;

      for (let i = 1; i <= totalSets; i++) {
        const setCfg = item.setsConfig && item.setsConfig[i - 1];
        sets.push({
          setNumber: i,
          completed: false,
          actualReps: item.mode !== 'duration' ? (setCfg?.targetReps ?? item.targetReps ?? 10) : undefined,
          actualWeightKg: item.mode === 'weight_reps' ? (setCfg?.targetWeightKg ?? item.targetWeightKg ?? 20) : undefined,
          actualDurationSeconds:
            item.mode === 'duration' ? (setCfg?.targetDurationSeconds ?? item.targetDurationSeconds ?? 30) : undefined,
        });
      }

      return {
        exerciseId: item.exerciseId || `ex-${idx}`,
        exerciseName: item.exerciseName || 'Ejercicio',
        mode: item.mode || 'weight_reps',
        gifUrl: item.gifUrl,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: 'session-' + Date.now(),
      routineId: routine?.id,
      routineName: routine?.name || 'Entrenamiento',
      date: getLocalDateString(),
      startedAt: new Date().toISOString(),
      exercises: workoutExercises,
      isCompleted: false,
    };

    setActiveWorkout(newSession);
    StorageService.saveActiveWorkout(newSession);
    notificationService.scheduleWorkoutReminders(newSession);
    return newSession;
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    const targetSets = [...targetExercise.sets];
    const targetSet = { ...targetSets[setIndex] };

    targetSet.completed = !targetSet.completed;
    targetSets[setIndex] = targetSet;
    targetExercise.sets = targetSets;
    updatedExercises[exerciseIndex] = targetExercise;

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const updateSetValues = (
    exerciseIndex: number,
    setIndex: number,
    values: Partial<WorkoutSetResult>
  ) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    const targetSets = [...targetExercise.sets];
    targetSets[setIndex] = {
      ...targetSets[setIndex],
      ...values,
    };
    targetExercise.sets = targetSets;
    updatedExercises[exerciseIndex] = targetExercise;

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const addExerciseToActiveWorkout = (exercise: ExerciseDefinition) => {
    if (!activeWorkout) return;
    const defaultSets: WorkoutSetResult[] = [
      {
        setNumber: 1,
        completed: false,
        actualWeightKg: exercise.defaultMode === 'weight_reps' ? 20 : undefined,
        actualReps: exercise.defaultMode !== 'duration' ? 10 : undefined,
        actualDurationSeconds: exercise.defaultMode === 'duration' ? 30 : undefined,
      },
      {
        setNumber: 2,
        completed: false,
        actualWeightKg: exercise.defaultMode === 'weight_reps' ? 20 : undefined,
        actualReps: exercise.defaultMode !== 'duration' ? 10 : undefined,
        actualDurationSeconds: exercise.defaultMode === 'duration' ? 30 : undefined,
      },
      {
        setNumber: 3,
        completed: false,
        actualWeightKg: exercise.defaultMode === 'weight_reps' ? 20 : undefined,
        actualReps: exercise.defaultMode !== 'duration' ? 10 : undefined,
        actualDurationSeconds: exercise.defaultMode === 'duration' ? 30 : undefined,
      },
    ];

    const newExResult: WorkoutExerciseResult = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      mode: exercise.defaultMode,
      gifUrl: exercise.gifUrl,
      sets: defaultSets,
    };

    const updated: WorkoutSession = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExResult],
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const removeExerciseFromActiveWorkout = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.filter((_, idx) => idx !== exerciseIndex);
    const updated: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const reorderExerciseInActiveWorkout = (fromIndex: number, toIndex: number) => {
    if (!activeWorkout) return;
    if (toIndex < 0 || toIndex >= activeWorkout.exercises.length) return;
    const updatedExercises = [...activeWorkout.exercises];
    const [moved] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, moved);
    const updated: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const addSetToActiveWorkout = (exerciseIndex: number) => {
    if (!activeWorkout || !activeWorkout.exercises[exerciseIndex]) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetEx = { ...updatedExercises[exerciseIndex] };
    const sets = [...targetEx.sets];
    const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;

    const newSet: WorkoutSetResult = {
      setNumber: sets.length + 1,
      completed: false,
      actualWeightKg: lastSet?.actualWeightKg ?? (targetEx.mode === 'weight_reps' ? 20 : undefined),
      actualReps: lastSet?.actualReps ?? (targetEx.mode !== 'duration' ? 10 : undefined),
      actualDurationSeconds: lastSet?.actualDurationSeconds ?? (targetEx.mode === 'duration' ? 30 : undefined),
    };

    targetEx.sets = [...sets, newSet];
    updatedExercises[exerciseIndex] = targetEx;

    const updated: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const removeSetFromActiveWorkout = (exerciseIndex: number, setIndex?: number) => {
    if (!activeWorkout || !activeWorkout.exercises[exerciseIndex]) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetEx = { ...updatedExercises[exerciseIndex] };
    if (targetEx.sets.length <= 1) return; // Keep at least one set

    const targetSetIndex = setIndex !== undefined ? setIndex : targetEx.sets.length - 1;
    const filteredSets = targetEx.sets.filter((_, idx) => idx !== targetSetIndex);
    targetEx.sets = filteredSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    updatedExercises[exerciseIndex] = targetEx;

    const updated: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises,
    };
    setActiveWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const handleSaveDailyActivity = (activity: DailyActivity) => {
    const updated = StorageService.saveDailyActivity(activity);
    setDailyActivities(updated);
  };

  const updateWorkoutSession = (session: WorkoutSession) => {
    const updated = StorageService.saveWorkoutSession(session);
    setWorkoutSessions(updated);
  };

  const finishActiveWorkout = (
    notes?: string,
    syncToRoutine?: boolean,
    caloriesBurned?: number,
    steps?: number
  ): WorkoutSession | null => {
    if (!activeWorkout) return null;
    const completedAt = new Date().toISOString();
    const startMs = new Date(activeWorkout.startedAt).getTime();
    const durationMinutes = Math.max(1, Math.round((Date.now() - startMs) / 60000));

    // Optionally sync changes back to original routine
    if (syncToRoutine && activeWorkout.routineId) {
      const routine = routines.find((r) => r.id === activeWorkout.routineId);
      if (routine) {
        const updatedRoutineExercises: RoutineExerciseConfig[] = (activeWorkout.exercises || []).map((ex, idx) => {
          const existing = (routine.exercises || []).find((re) => re.exerciseId === ex.exerciseId);
          const firstSet = (ex.sets || [])[0];
          const setsConfig = (ex.sets || []).map((s) => ({
            setNumber: s.setNumber,
            targetReps: s.actualReps,
            targetWeightKg: s.actualWeightKg,
            targetDurationSeconds: s.actualDurationSeconds,
          }));
          return {
            id: existing?.id || `rex-${Date.now()}-${idx}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            mode: ex.mode,
            gifUrl: ex.gifUrl,
            targetSets: (ex.sets || []).length || 3,
            targetReps: firstSet?.actualReps ?? existing?.targetReps ?? 10,
            targetWeightKg: firstSet?.actualWeightKg ?? existing?.targetWeightKg ?? 20,
            targetDurationSeconds: firstSet?.actualDurationSeconds ?? existing?.targetDurationSeconds ?? 30,
            restSeconds: existing?.restSeconds ?? 60,
            notes: existing?.notes,
            setsConfig,
          };
        });

        const updatedRoutine: Routine = {
          ...routine,
          exercises: updatedRoutineExercises,
          updatedAt: new Date().toISOString(),
        };
        handleSaveRoutine(updatedRoutine);
      }
    }

    const finishedSession: WorkoutSession = {
      ...activeWorkout,
      completedAt,
      durationMinutes,
      notes: notes || activeWorkout.notes,
      caloriesBurned: caloriesBurned !== undefined ? caloriesBurned : activeWorkout.caloriesBurned,
      steps: steps !== undefined ? steps : activeWorkout.steps,
      isCompleted: true,
    };

    const updated = StorageService.saveWorkoutSession(finishedSession);
    setWorkoutSessions(updated);
    setActiveWorkout(null);
    StorageService.saveActiveWorkout(null);
    notificationService.cancelWorkoutReminders();
    return finishedSession;
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
    StorageService.saveActiveWorkout(null);
    notificationService.cancelWorkoutReminders();
  };

  const deleteWorkoutSession = (sessionId: string) => {
    const updated = StorageService.deleteWorkoutSession(sessionId);
    setWorkoutSessions(updated);
  };

  const resetAllData = () => {
    StorageService.clearAllData();
    notificationService.cancelWorkoutReminders();
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        hasProfile,
        routines,
        exercises,
        weightRecords,
        workoutSessions,
        activeWorkout,
        foodEntries,
        dailyActivities,
        activityLevel,
        calorieRecommendation,
        saveProfile: handleSaveProfile,
        saveRoutine: handleSaveRoutine,
        deleteRoutine: handleDeleteRoutine,
        saveExercise: handleSaveExercise,
        saveWeightRecord: handleSaveWeightRecord,
        deleteWeightRecord: handleDeleteWeightRecord,
        saveFoodEntry: handleSaveFoodEntry,
        deleteFoodEntry: handleDeleteFoodEntry,
        saveDailyActivity: handleSaveDailyActivity,
        setActivityLevel: handleSetActivityLevel,
        startWorkout,
        updateWorkoutSession,
        deleteWorkoutSession,
        toggleSetCompleted,
        updateSetValues,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        reorderExerciseInActiveWorkout,
        addSetToActiveWorkout,
        removeSetFromActiveWorkout,
        finishActiveWorkout,
        cancelActiveWorkout,
        refreshData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

