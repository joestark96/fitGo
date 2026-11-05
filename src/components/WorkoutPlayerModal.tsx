import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonText,
  IonInput,
  IonAlert,
  IonProgressBar,
  IonToast,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonList,
} from '@ionic/react';
import {
  closeOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  trophyOutline,
  timerOutline,
  pauseOutline,
  playOutline,
  addOutline,
  removeOutline,
  trashOutline,
  addCircleOutline,
  chevronUpOutline,
  chevronDownOutline,
  reorderTwoOutline,
  swapVerticalOutline,
  checkmarkOutline,
  swapHorizontalOutline,
  homeOutline,
  scaleOutline,
  createOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ExerciseGif } from './ExerciseGif';
import { ExerciseCatalogModal } from './ExerciseCatalogModal';
import { WeightConverterModal } from './WeightConverterModal';
import { ExerciseDefinition, WorkoutSetResult } from '../types';
import { StorageService } from '../services/storage';

interface WorkoutPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SessionSummary {
  sessionId?: string;
  routineName: string;
  durationFormatted: string;
  totalSets: number;
  completedSets: number;
  totalVolumeKg: number;
  exercises: {
    name: string;
    completedSetsCount: number;
    totalSetsCount: number;
    sets: { setNumber: number; weight?: number; reps?: number; duration?: number }[];
  }[];
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    profile,
    activeWorkout,
    workoutSessions,
    toggleSetCompleted,
    updateSetValues,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    reorderExerciseInActiveWorkout,
    addSetToActiveWorkout,
    removeSetFromActiveWorkout,
    finishActiveWorkout,
    updateWorkoutSession,
    cancelActiveWorkout,
  } = useApp();

  // Session summary & auto-redirect timer
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [redirectSeconds, setRedirectSeconds] = useState<number>(15);

  // Workout duration timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest countdown timer
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restMaxDuration, setRestMaxDuration] = useState<number>(60);

  // Alert confirmations & dialogs
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showFinishAlert, setShowFinishAlert] = useState(false);
  const [finishSnapshotSeconds, setFinishSnapshotSeconds] = useState<number | null>(null);
  const [syncRoutineChecked, setSyncRoutineChecked] = useState<boolean>(true);
  const [exerciseIndexToDelete, setExerciseIndexToDelete] = useState<number | null>(null);

  const handleOpenFinishAlert = () => {
    setFinishSnapshotSeconds(elapsedSeconds);
    setSyncRoutineChecked(true);
    setShowFinishAlert(true);
  };

  const handleCloseFinishAlert = () => {
    setShowFinishAlert(false);
    setFinishSnapshotSeconds(null);
  };

  // Exercise Catalog Modal state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConverterModal, setShowConverterModal] = useState<boolean>(false);

  // Accordion & Reorder state
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [expandedExIndices, setExpandedExIndices] = useState<Record<number, boolean>>({});
  const [isReordering, setIsReordering] = useState(false);
  const [draggedExIdx, setDraggedExIdx] = useState<number | null>(null);
  const [dragOverExIdx, setDragOverExIdx] = useState<number | null>(null);

  // Selected weight input target for the unit converter
  const [selectedWeightTarget, setSelectedWeightTarget] = useState<{
    exIdx: number;
    setIdx: number;
    exerciseName: string;
    setNumber: number;
    currentKg: number;
  } | null>(null);

  // Tracks which sets are being edited individually without cascading
  const [singleEditSets, setSingleEditSets] = useState<Record<string, boolean>>({});

  const toggleSingleEditSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;
    setSingleEditSets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Weight units state per exercise ('kg' | 'lb')
  const [exerciseWeightUnits, setExerciseWeightUnits] = useState<Record<number, 'kg' | 'lb'>>({});

  const defaultUnit = profile?.preferredWeightUnit || 'kg';
  const getWeightUnit = (exIdx: number): 'kg' | 'lb' => exerciseWeightUnits[exIdx] || defaultUnit;

  const toggleWeightUnit = (exIdx: number) => {
    setExerciseWeightUnits((prev) => ({
      ...prev,
      [exIdx]: (prev[exIdx] || defaultUnit) === 'lb' ? 'kg' : 'lb',
    }));
  };

  // Past exercise history lookup
  const previousExerciseHistory = useMemo(() => {
    const pastSessions = (workoutSessions || [])
      .filter((s) => s.isCompleted && s.id !== activeWorkout?.id)
      .sort(
        (a, b) =>
          new Date(b.date || b.completedAt || 0).getTime() -
          new Date(a.date || a.completedAt || 0).getTime()
      );

    const historyMap: Record<
      string,
      {
        date: string;
        sets: { setNumber: number; weightKg?: number; reps?: number; durationSeconds?: number }[];
      }
    > = {};

    for (const session of pastSessions) {
      for (const ex of session.exercises || []) {
        if (!historyMap[ex.exerciseId] && ex.sets && ex.sets.length > 0) {
          historyMap[ex.exerciseId] = {
            date: session.date,
            sets: ex.sets.map((st) => ({
              setNumber: st.setNumber,
              weightKg: st.actualWeightKg,
              reps: st.actualReps,
              durationSeconds: st.actualDurationSeconds,
            })),
          };
        }
      }
    }
    return historyMap;
  }, [workoutSessions, activeWorkout?.id]);

  // Update set value with downward cascade unless singleSetOnly or set is completed
  const handleUpdateSetValue = (
    exIdx: number,
    setIdx: number,
    values: Partial<WorkoutSetResult>,
    singleSetOnly: boolean = false
  ) => {
    if (!activeWorkout || !activeWorkout.exercises[exIdx]) return;
    const ex = activeWorkout.exercises[exIdx];
    const currentSet = ex.sets?.[setIdx];
    const isCompleted = !!currentSet?.completed;
    const isSingle = singleSetOnly || isCompleted || !!singleEditSets[`${exIdx}-${setIdx}`];

    updateSetValues(exIdx, setIdx, values);

    // If not single edit mode, cascade to all subsequent uncompleted sets in this exercise
    if (!isSingle && ex.sets) {
      for (let i = setIdx + 1; i < ex.sets.length; i++) {
        const nextSet = ex.sets[i];
        if (nextSet && !nextSet.completed) {
          updateSetValues(exIdx, i, values);
        }
      }
    }
  };

  // Expand all exercises when workout starts or opens
  useEffect(() => {
    if (isOpen) {
      if (activeWorkout) {
        const initial: Record<number, boolean> = {};
        (activeWorkout.exercises || []).forEach((_, idx) => {
          initial[idx] = true;
        });
        setExpandedExIndices(initial);
        setIsReordering(false);
        setDraggedExIdx(null);
        setDragOverExIdx(null);
      }
    } else {
      setShowCancelAlert(false);
      setShowFinishAlert(false);
      setRestSecondsLeft(null);
      setIsCatalogOpen(false);
      setShowConverterModal(false);
    }
  }, [isOpen, activeWorkout?.startedAt]);

  const isExerciseExpanded = (idx: number) => {
    return !!expandedExIndices[idx] && !isReordering;
  };

  const toggleExerciseExpanded = (idx: number) => {
    setExpandedExIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const collapseAllExercises = () => {
    setExpandedExIndices({});
  };

  const expandAllExercises = () => {
    const all: Record<number, boolean> = {};
    activeWorkout?.exercises.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedExIndices(all);
  };

  const handleToggleReorder = () => {
    if (!isReordering) {
      // Activating drag and drop reorder -> auto-collapse all exercise accordions
      collapseAllExercises();
    }
    setIsReordering(!isReordering);
  };

  const handleDragStart = (idx: number, e: React.DragEvent) => {
    // When drag starts on any card -> auto-collapse all exercise accordions
    collapseAllExercises();
    setDraggedExIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverExIdx !== idx) {
      setDragOverExIdx(idx);
    }
  };

  const handleDrop = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedExIdx !== null && draggedExIdx !== idx) {
      reorderExerciseInActiveWorkout(draggedExIdx, idx);
    }
    setDraggedExIdx(null);
    setDragOverExIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedExIdx(null);
    setDragOverExIdx(null);
  };

  // Sync elapsed timer from activeWorkout start time
  useEffect(() => {
    if (activeWorkout?.startedAt) {
      const startMs = new Date(activeWorkout.startedAt).getTime();
      const currentElapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsedSeconds(currentElapsed);
    }
  }, [activeWorkout?.startedAt]);

  // Elapsed timer loop
  useEffect(() => {
    let interval: any = null;
    if (isOpen && activeWorkout && isTimerRunning && !showFinishAlert) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, activeWorkout, isTimerRunning, showFinishAlert]);

  // Rest countdown timer loop
  useEffect(() => {
    let interval: any = null;
    if (restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setRestSecondsLeft(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restSecondsLeft]);

  const handleDismiss = () => {
    setSessionSummary(null);
    setRedirectSeconds(15);
    setRestSecondsLeft(null);
    setShowCancelAlert(false);
    setShowFinishAlert(false);
    setFinishSnapshotSeconds(null);
    setSyncRoutineChecked(true);
    onClose();
  };

  const handleGoHome = () => {
    onClose();
    try {
      navigate('/workouts');
    } catch {
      window.location.href = '/workouts';
    }
  };

  // 15-second countdown timer for auto-redirection to home
  useEffect(() => {
    let timer: any = null;
    if (sessionSummary !== null && isOpen) {
      if (redirectSeconds > 0) {
        timer = setInterval(() => {
          setRedirectSeconds((prev) => prev - 1);
        }, 1000);
      } else {
        handleGoHome();
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionSummary, redirectSeconds, isOpen]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Calculate total sets and completed sets safely
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  if (activeWorkout?.exercises) {
    activeWorkout.exercises.forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        totalSetsCount++;
        if (s.completed) completedSetsCount++;
      });
    });
  }

  const progress = totalSetsCount > 0 ? completedSetsCount / totalSetsCount : 0;

  const nextPendingSet = useMemo(() => {
    if (!activeWorkout || !activeWorkout.exercises) return null;
    for (let exIdx = 0; exIdx < activeWorkout.exercises.length; exIdx++) {
      const exercise = activeWorkout.exercises[exIdx];
      if (!exercise || !exercise.sets) continue;
      for (let setIdx = 0; setIdx < exercise.sets.length; setIdx++) {
        const set = exercise.sets[setIdx];
        if (set && !set.completed) {
          return {
            exerciseIndex: exIdx,
            setIndex: setIdx,
            exerciseName: exercise.exerciseName,
            gifUrl: exercise.gifUrl,
            mode: exercise.mode,
            setNumber: set.setNumber,
            weightKg: set.actualWeightKg,
            reps: set.actualReps,
            durationSeconds: set.actualDurationSeconds,
          };
        }
      }
    }
    return null;
  }, [activeWorkout]);

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    if (!activeWorkout || !activeWorkout.exercises[exIdx]) return;
    const targetExercise = activeWorkout.exercises[exIdx];
    if (!targetExercise.sets || !targetExercise.sets[setIdx]) return;
    const targetSet = targetExercise.sets[setIdx];
    const willBeCompleted = !targetSet.completed;
    toggleSetCompleted(exIdx, setIdx);

    // If marked completed
    if (willBeCompleted) {
      // Check if this was the last remaining uncompleted set in the entire workout
      let remainingUncompleted = 0;
      activeWorkout.exercises.forEach((ex, eI) => {
        (ex.sets || []).forEach((s, sI) => {
          if (eI === exIdx && sI === setIdx) {
            // this set is completing now
          } else if (!s.completed) {
            remainingUncompleted++;
          }
        });
      });

      if (remainingUncompleted === 0) {
        // Last set completed! Skip rest timer and scroll to finish button
        setRestSecondsLeft(null);
        setTimeout(() => {
          contentRef.current?.scrollToBottom(500);
        }, 120);
        setToastMessage('🎉 ¡Todas las series completadas! Puedes finalizar tu entrenamiento.');
      } else {
        const suggestedRest = 60;
        setRestMaxDuration(suggestedRest);
        setRestSecondsLeft(suggestedRest);
      }
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelAlert(false);
    cancelActiveWorkout();
    onClose();
  };

  const handleSelectExerciseFromCatalog = (exercise: ExerciseDefinition) => {
    addExerciseToActiveWorkout(exercise);
    setIsCatalogOpen(false);
    setToastMessage(`¡"${exercise.name}" agregado a tu entrenamiento!`);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
      {sessionSummary ? (
        <>
        <IonHeader>
          <IonToolbar className="fit-navbar" style={{ ['--background' as any]: '#101318' }}>
            <IonTitle style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>
              RESUMEN DE SESIÓN
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent style={{ ['--background' as any]: '#101318' }}>
          <div style={{ padding: '24px 18px', maxWidth: '600px', margin: '0 auto', color: '#f8fafc' }}>
            {/* Celebration Card */}
            <div
              style={{
                background: 'linear-gradient(180deg, #162032 0%, #161b24 100%)',
                borderRadius: '20px',
                padding: '24px 18px',
                textAlign: 'center',
                border: '1px solid #233148',
                marginBottom: '20px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '2px solid #3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)',
                }}
              >
                <IonIcon icon={trophyOutline} style={{ fontSize: '2.5rem', color: '#60a5fa' }} />
              </div>

              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                }}
              >
                ¡Entrenamiento Completado!
              </h2>

              <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.92rem' }}>
                Has finalizado con éxito <strong style={{ color: '#f8fafc' }}>{sessionSummary.routineName}</strong>
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  color: '#93c5fd',
                  fontWeight: 600,
                }}
              >
                <IonIcon icon={timerOutline} style={{ fontSize: '1rem' }} />
                <span>Volviendo al inicio automáticamente en <strong>{redirectSeconds}s</strong></span>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: '#161b24',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  textAlign: 'center',
                  border: '1px solid #232c3d',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                  Tiempo
                </div>
                <div
                  style={{
                    color: '#3b82f6',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sessionSummary.durationFormatted}
                </div>
              </div>

              <div
                style={{
                  background: '#161b24',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  textAlign: 'center',
                  border: '1px solid #232c3d',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                  Volumen
                </div>
                <div
                  style={{
                    color: '#3b82f6',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sessionSummary.totalVolumeKg >= 1000
                    ? `${(sessionSummary.totalVolumeKg / 1000).toFixed(1)}K kg`
                    : `${sessionSummary.totalVolumeKg} kg`}
                </div>
              </div>

              <div
                style={{
                  background: '#161b24',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  textAlign: 'center',
                  border: '1px solid #232c3d',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                  Series
                </div>
                <div
                  style={{
                    color: '#10b981',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sessionSummary.completedSets}/{sessionSummary.totalSets}
                </div>
              </div>
            </div>

            {/* Exercises Performed Breakdown */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 4px' }}>
                Ejercicios Realizados ({sessionSummary.exercises.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sessionSummary.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#161b24',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      border: '1px solid #232c3d',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff' }}>
                        {ex.name}
                      </span>
                      <IonBadge color="success" style={{ fontSize: '0.72rem' }}>
                        {ex.completedSetsCount}/{ex.totalSetsCount} series
                      </IonBadge>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {ex.sets.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            background: '#10141c',
                            border: '1px solid #1e2636',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.76rem',
                            color: '#94a3b8',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          S{s.setNumber}: {s.weight ? `${s.weight}kg × ` : ''}{s.reps ? `${s.reps} reps` : s.duration ? `${s.duration}s` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </IonContent>

        {/* Sticky Button: Volver al inicio */}
        <IonFooter className="ion-no-border" style={{ background: '#101318', borderTop: '1px solid #1e2636' }}>
          <div style={{ padding: '12px 16px env(safe-area-inset-bottom, 12px)' }}>
            <button
              type="button"
              onClick={handleGoHome}
              style={{
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(37, 99, 235, 0.45)',
              }}
            >
              <IonIcon icon={homeOutline} style={{ fontSize: '1.3rem' }} />
              <span>Volver al inicio ({redirectSeconds}s)</span>
            </button>
          </div>
        </IonFooter>
        </>
      ) : activeWorkout ? (
        <>
      <IonHeader>
        <IonToolbar className="fit-navbar">
          <IonButtons slot="start">
            <IonButton onClick={() => setShowCancelAlert(true)}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: 800, letterSpacing: '-0.3px' }}>
            {activeWorkout.routineName}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => setShowConverterModal(true)}
              style={{ fontWeight: 700, fontSize: '0.8rem' }}
              title="Convertidor de Libras a Kilos"
            >
              <IonIcon slot="start" icon={swapHorizontalOutline} />
              Lb ⇄ Kg
            </IonButton>
            <IonButton
              fill="clear"
              color="primary"
              onClick={() => setIsCatalogOpen(true)}
              style={{ fontWeight: 700, fontSize: '0.85rem' }}
            >
              <IonIcon slot="start" icon={addOutline} />
              Ejercicio
            </IonButton>
            <IonButton
              fill="solid"
              color="success"
              style={{ fontWeight: 800, borderRadius: '12px' }}
              onClick={handleOpenFinishAlert}
            >
              Terminar
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Progress bar and metrics */}
        <div
          style={{
            background: 'var(--ion-color-step-50, #18181b)',
            color: 'var(--ion-text-color)',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--ion-color-step-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IonIcon icon={timerOutline} color="primary" style={{ fontSize: '1.3rem' }} />
            <strong style={{ fontSize: '1.25rem', letterSpacing: '0.5px', fontWeight: 900 }}>
              {formatTime(elapsedSeconds)}
            </strong>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                width: '28px',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={isTimerRunning ? 'Pausar cronómetro' : 'Reanudar cronómetro'}
            >
              <IonIcon icon={isTimerRunning ? pauseOutline : playOutline} style={{ fontSize: '14px' }} />
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.3px' }}>
              Series: <span style={{ color: 'var(--ion-color-success)' }}>{completedSetsCount}</span> / {totalSetsCount} ({Math.round(progress * 100)}%)
            </span>
          </div>
        </div>
        <IonProgressBar value={progress} color="success" style={{ height: '4px' }} />
      </IonHeader>

      <IonContent ref={contentRef} className="ion-padding" style={{ paddingBottom: '90px' }}>
        {/* Exercises list header with Reorder & Accordion controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ejercicios ({activeWorkout.exercises.length})
            </span>
            {activeWorkout.exercises.length > 1 && (
              <IonButton
                size="small"
                fill={isReordering ? 'solid' : 'outline'}
                color={isReordering ? 'primary' : 'medium'}
                onClick={handleToggleReorder}
                style={{ fontWeight: 700, margin: 0, height: '30px' }}
              >
                <IonIcon slot="start" icon={isReordering ? checkmarkOutline : swapVerticalOutline} />
                {isReordering ? 'Listo' : 'Reordenar'}
              </IonButton>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isReordering && activeWorkout.exercises.length > 0 && (
              <IonButton
                size="small"
                fill="clear"
                color="medium"
                onClick={() => {
                  const anyOpen = Object.values(expandedExIndices).some(Boolean);
                  if (anyOpen) collapseAllExercises();
                  else expandAllExercises();
                }}
                style={{ margin: 0, height: '30px' }}
                title={Object.values(expandedExIndices).some(Boolean) ? 'Colapsar todos' : 'Expandir todos'}
              >
                <IonIcon slot="icon-only" icon={Object.values(expandedExIndices).some(Boolean) ? chevronUpOutline : chevronDownOutline} />
              </IonButton>
            )}
            <IonButton
              size="small"
              fill="outline"
              color="primary"
              onClick={() => setIsCatalogOpen(true)}
              style={{ margin: 0, height: '30px', fontWeight: 600 }}
            >
              <IonIcon slot="start" icon={addOutline} />
              Agregar
            </IonButton>
          </div>
        </div>

        {/* Exercises list with interactive Sets (Accordion + Drag and Drop) */}
        {(activeWorkout?.exercises || []).map((exercise, exIdx) => {
          const isExpanded = isExerciseExpanded(exIdx);
          const isDraggingThis = draggedExIdx === exIdx;
          const isOverThis = dragOverExIdx === exIdx;
          const sets = exercise.sets || [];
          const completedCount = sets.filter((s) => s.completed).length;
          const totalCount = sets.length;
          const allCompleted = totalCount > 0 && completedCount === totalCount;

          return (
            <IonCard
              key={exercise.exerciseId + '-' + exIdx}
              draggable
              onDragStart={(e) => handleDragStart(exIdx, e)}
              onDragOver={(e) => handleDragOver(exIdx, e)}
              onDrop={(e) => handleDrop(exIdx, e)}
              onDragEnd={handleDragEnd}
              className={`${isDraggingThis ? 'dragging-card' : ''} ${isOverThis ? 'drag-over-card' : ''}`}
              style={{
                margin: '0 0 12px',
                borderRadius: '16px',
                border: isReordering
                  ? '1px dashed var(--ion-color-step-200, #3f3f46)'
                  : allCompleted
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : undefined,
                transition: 'all 0.15s ease',
              }}
            >
              <IonCardHeader
                className="accordion-header"
                onClick={() => {
                  if (!isReordering) toggleExerciseExpanded(exIdx);
                }}
                style={{
                  padding: '12px 14px',
                  background: isExpanded
                    ? 'var(--ion-color-step-50, rgba(255,255,255,0.02))'
                    : undefined,
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Drag handle */}
                  <div
                    className="drag-handle"
                    title="Arrastrar para mover de lugar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IonIcon icon={reorderTwoOutline} style={{ fontSize: '20px' }} />
                  </div>

                  <span
                    style={{
                      background: 'var(--ion-color-step-100, #27272a)',
                      color: 'var(--ion-text-color, #f4f4f5)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    #{exIdx + 1}
                  </span>

                  <ExerciseGif
                    gifUrl={exercise.gifUrl}
                    exerciseName={exercise.exerciseName}
                    size="small"
                    allowZoom={true}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IonCardTitle
                        style={{
                          fontSize: '1.02rem',
                          fontWeight: 700,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {exercise.exerciseName}
                      </IonCardTitle>
                    </div>

                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <IonBadge
                        color={allCompleted ? 'success' : completedCount > 0 ? 'warning' : 'medium'}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {completedCount}/{totalCount} series
                      </IonBadge>
                      <IonBadge color="light" style={{ fontSize: '0.72rem' }}>
                        {exercise.mode === 'weight_reps'
                          ? 'Peso + Reps'
                          : exercise.mode === 'duration'
                          ? 'Duración'
                          : 'Solo Reps'}
                      </IonBadge>
                    </div>
                  </div>

                  {/* Up / Down Controls in Reorder Mode */}
                  {isReordering && (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IonButton
                        fill="clear"
                        size="small"
                        color="medium"
                        disabled={exIdx === 0}
                        style={{ margin: 0, height: '28px', width: '28px' }}
                        onClick={() => reorderExerciseInActiveWorkout(exIdx, exIdx - 1)}
                        title="Subir"
                      >
                        <IonIcon slot="icon-only" icon={chevronUpOutline} style={{ fontSize: '18px' }} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        size="small"
                        color="medium"
                        disabled={exIdx === activeWorkout.exercises.length - 1}
                        style={{ margin: 0, height: '28px', width: '28px' }}
                        onClick={() => reorderExerciseInActiveWorkout(exIdx, exIdx + 1)}
                        title="Bajar"
                      >
                        <IonIcon slot="icon-only" icon={chevronDownOutline} style={{ fontSize: '18px' }} />
                      </IonButton>
                    </div>
                  )}

                  {/* Accordion Chevron toggle when not reordering */}
                  {!isReordering && (
                    <IonIcon
                      icon={chevronDownOutline}
                      className={`accordion-chevron ${isExpanded ? 'is-open' : ''}`}
                      style={{ fontSize: '18px', color: 'var(--ion-color-medium)' }}
                    />
                  )}

                  {/* Remove Exercise */}
                  <IonButton
                    fill="clear"
                    size="small"
                    color="danger"
                    style={{ margin: 0, height: '32px', width: '32px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExerciseIndexToDelete(exIdx);
                    }}
                    title="Quitar ejercicio de la rutina"
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} style={{ fontSize: '16px' }} />
                  </IonButton>
                </div>
              </IonCardHeader>

              {/* Accordion Body - Sets and inputs */}
              {isExpanded && (
                <IonCardContent style={{ padding: '0 8px 12px', borderTop: '1px solid var(--ion-color-step-100, #27272a)' }}>
              {/* Table / List Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    exercise.mode === 'weight_reps' ? '52px 38px 1fr 1fr' : '52px 38px 2fr',
                  padding: '8px 4px',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                <div>LISTO</div>
                <div>SET</div>
                {exercise.mode === 'weight_reps' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                      <span>PESO</span>
                      <button
                        type="button"
                        onClick={() => toggleWeightUnit(exIdx)}
                        style={{
                          background: getWeightUnit(exIdx) === 'lb' ? '#2563eb' : '#232c3d',
                          color: getWeightUnit(exIdx) === 'lb' ? '#ffffff' : '#60a5fa',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          padding: '1px 5px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        title={`Toca para cambiar a ${getWeightUnit(exIdx) === 'lb' ? 'Kilogramos (kg)' : 'Libras (lb)'}`}
                      >
                        <span>{getWeightUnit(exIdx).toUpperCase()}</span>
                        <IonIcon icon={swapHorizontalOutline} style={{ fontSize: '10px' }} />
                      </button>
                    </div>
                    <div>REPS</div>
                  </>
                )}
                {exercise.mode === 'reps_only' && <div>REPETICIONES</div>}
                {exercise.mode === 'duration' && <div>SEGUNDOS</div>}
              </div>

              {/* Set Rows with Swipe Right to Delete (IonItemSliding) */}
              <IonList style={{ background: 'transparent', padding: 0 }}>
                {(exercise.sets || []).map((s, setIdx) => {
                  const setKey = `${exIdx}-${setIdx}`;
                  const isSingleEdit = !!singleEditSets[setKey];
                  const prevSetHistory =
                    previousExerciseHistory[exercise.exerciseId]?.sets?.find(
                      (hs) => hs.setNumber === s.setNumber
                    ) || previousExerciseHistory[exercise.exerciseId]?.sets?.[setIdx];

                  return (
                    <IonItemSliding
                      key={setIdx}
                      style={{
                        background: 'transparent',
                        marginBottom: '6px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Swipe to the right reveals delete button */}
                      <IonItemOptions side="start">
                        <IonItemOption
                          color="danger"
                          disabled={(exercise.sets || []).length <= 1}
                          onClick={() => {
                            removeSetFromActiveWorkout(exIdx, setIdx);
                            setToastMessage(`Serie #${s.setNumber} eliminada`);
                          }}
                          style={{
                            fontWeight: 800,
                            padding: '0 16px',
                            borderRadius: '12px 0 0 12px',
                          }}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonItemOption>
                      </IonItemOptions>

                      <IonItem
                        lines="none"
                        style={{
                          '--background': s.completed
                            ? 'rgba(16, 185, 129, 0.12)'
                            : setIdx % 2 === 0
                            ? '#161b24'
                            : '#131720',
                          '--padding-start': '4px',
                          '--inner-padding-end': '4px',
                          '--min-height': 'auto',
                          border: s.completed
                            ? '1.5px solid rgba(16, 185, 129, 0.4)'
                            : isSingleEdit
                            ? '1.5px solid rgba(59, 130, 246, 0.5)'
                            : '1px solid #232c3d',
                          borderRadius: '12px',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              exercise.mode === 'weight_reps'
                                ? '52px 38px 1fr 1fr'
                                : '52px 38px 2fr',
                            alignItems: 'center',
                            width: '100%',
                            padding: '6px 2px',
                          }}
                        >
                          {/* 1. Listo Button on the LEFT */}
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleSet(exIdx, setIdx)}
                              style={{
                                width: '42px',
                                height: '36px',
                                borderRadius: '8px',
                                border: s.completed ? 'none' : '1.5px solid #3b82f6',
                                background: s.completed ? '#10b981' : 'transparent',
                                color: s.completed ? '#ffffff' : '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title={s.completed ? 'Serie completada' : 'Marcar serie como hecha'}
                            >
                              <IonIcon
                                icon={s.completed ? checkmarkCircle : checkmarkCircleOutline}
                                style={{ fontSize: '1.35rem' }}
                              />
                            </button>
                          </div>

                          {/* 2. Set Number */}
                          <div style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: s.completed
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : 'rgba(255, 255, 255, 0.06)',
                                color: s.completed ? '#10b981' : '#94a3b8',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              #{s.setNumber}
                            </span>
                          </div>

                          {/* 3. Mode-specific Inputs with Downward Propagation & History Badges */}
                          {exercise.mode === 'weight_reps' && (
                            <>
                              <div style={{ padding: '0 4px' }}>
                                <IonInput
                                  type="number"
                                  step={getWeightUnit(exIdx) === 'lb' ? '1' : '0.5'}
                                  value={
                                    s.actualWeightKg !== undefined && s.actualWeightKg !== null
                                      ? getWeightUnit(exIdx) === 'lb'
                                        ? Number((s.actualWeightKg * 2.20462262).toFixed(1))
                                        : s.actualWeightKg
                                      : ''
                                  }
                                  placeholder="0"
                                  onFocus={() => {
                                    setSelectedWeightTarget({
                                      exIdx,
                                      setIdx,
                                      exerciseName: exercise.exerciseName,
                                      setNumber: s.setNumber,
                                      currentKg: s.actualWeightKg || 0,
                                    });
                                  }}
                                  style={{
                                    textAlign: 'center',
                                    background: s.completed ? 'rgba(16, 185, 129, 0.08)' : '#10141c',
                                    borderRadius: '8px',
                                    border: s.completed
                                      ? '1px solid rgba(16, 185, 129, 0.3)'
                                      : '1.5px solid #334155',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    color: s.completed ? '#10b981' : '#ffffff',
                                    height: '38px',
                                  }}
                                  onIonInput={(e) => {
                                    const val = parseFloat(e.detail.value || '0');
                                    const kg =
                                      getWeightUnit(exIdx) === 'lb'
                                        ? Number((val * 0.45359237).toFixed(1))
                                        : val;
                                    handleUpdateSetValue(exIdx, setIdx, {
                                      actualWeightKg: isNaN(kg) ? 0 : kg,
                                    });
                                  }}
                                />

                                {/* History pill: previous session weight/reps */}
                                {prevSetHistory?.weightKg !== undefined && (
                                  <div
                                    onClick={() => {
                                      // Click history to set ONLY this series without cascading below
                                      handleUpdateSetValue(
                                        exIdx,
                                        setIdx,
                                        {
                                          actualWeightKg: prevSetHistory.weightKg,
                                          actualReps: prevSetHistory.reps ?? s.actualReps,
                                        },
                                        true
                                      );
                                      setToastMessage(
                                        `Serie #${s.setNumber}: cargado peso previo (${prevSetHistory.weightKg} kg)`
                                      );
                                    }}
                                    style={{
                                      fontSize: '0.68rem',
                                      color: '#94a3b8',
                                      marginTop: '3px',
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                    }}
                                    title="Toca para usar este peso anterior solo en esta serie"
                                  >
                                    <span style={{ color: '#64748b' }}>Ant: </span>
                                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>
                                      {getWeightUnit(exIdx) === 'lb'
                                        ? Number(((prevSetHistory.weightKg || 0) * 2.20462).toFixed(1))
                                        : prevSetHistory.weightKg}
                                      {getWeightUnit(exIdx)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div style={{ padding: '0 4px' }}>
                                <IonInput
                                  type="number"
                                  value={s.actualReps ?? ''}
                                  placeholder="0"
                                  style={{
                                    textAlign: 'center',
                                    background: s.completed ? 'rgba(16, 185, 129, 0.08)' : '#10141c',
                                    borderRadius: '8px',
                                    border: s.completed
                                      ? '1px solid rgba(16, 185, 129, 0.3)'
                                      : '1.5px solid #334155',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    color: s.completed ? '#10b981' : '#ffffff',
                                    height: '38px',
                                  }}
                                  onIonInput={(e) =>
                                    handleUpdateSetValue(exIdx, setIdx, {
                                      actualReps: parseInt(e.detail.value || '0', 10),
                                    })
                                  }
                                />

                                {/* History pill / Single edit indicator */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    marginTop: '3px',
                                  }}
                                >
                                  {prevSetHistory?.reps !== undefined && (
                                    <span
                                      onClick={() => {
                                        handleUpdateSetValue(
                                          exIdx,
                                          setIdx,
                                          { actualReps: prevSetHistory.reps },
                                          true
                                        );
                                      }}
                                      style={{
                                        fontSize: '0.68rem',
                                        color: '#38bdf8',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                      }}
                                      title="Toca para usar reps anteriores solo en esta serie"
                                    >
                                      {prevSetHistory.reps} reps
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleSingleEditSet(exIdx, setIdx)}
                                    style={{
                                      background: isSingleEdit ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                                      border: isSingleEdit ? '1px solid #3b82f6' : 'none',
                                      borderRadius: '4px',
                                      color: isSingleEdit ? '#60a5fa' : '#64748b',
                                      fontSize: '0.64rem',
                                      fontWeight: 800,
                                      padding: '1px 3px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '2px',
                                    }}
                                    title={
                                      isSingleEdit
                                        ? 'Modo: Edita sólo esta serie (no cambia las series inferiores)'
                                        : 'Toca para editar solo esta serie (sin cambiar las de abajo)'
                                    }
                                  >
                                    <IonIcon icon={createOutline} style={{ fontSize: '9px' }} />
                                    <span>{isSingleEdit ? 'Solo esta' : '1x'}</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                          {exercise.mode === 'reps_only' && (
                            <div style={{ padding: '0 6px' }}>
                              <IonInput
                                type="number"
                                value={s.actualReps ?? ''}
                                placeholder="10"
                                style={{
                                  textAlign: 'center',
                                  background: s.completed ? 'rgba(16, 185, 129, 0.08)' : '#10141c',
                                  borderRadius: '8px',
                                  border: s.completed
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1.5px solid #334155',
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  color: s.completed ? '#10b981' : '#ffffff',
                                  height: '38px',
                                }}
                                onIonInput={(e) =>
                                  handleUpdateSetValue(exIdx, setIdx, {
                                    actualReps: parseInt(e.detail.value || '0', 10),
                                  })
                                }
                              />
                            </div>
                          )}

                          {exercise.mode === 'duration' && (
                            <div style={{ padding: '0 6px' }}>
                              <IonInput
                                type="number"
                                value={s.actualDurationSeconds ?? ''}
                                placeholder="30"
                                style={{
                                  textAlign: 'center',
                                  background: s.completed ? 'rgba(16, 185, 129, 0.08)' : '#10141c',
                                  borderRadius: '8px',
                                  border: s.completed
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1.5px solid #334155',
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  color: s.completed ? '#10b981' : '#ffffff',
                                  height: '38px',
                                }}
                                onIonInput={(e) =>
                                  handleUpdateSetValue(exIdx, setIdx, {
                                    actualDurationSeconds: parseInt(e.detail.value || '0', 10),
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      </IonItem>
                    </IonItemSliding>
                  );
                })}
              </IonList>

              {/* Swipe Right to delete helper note */}
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.7rem',
                  color: '#64748b',
                  margin: '2px 6px 6px',
                }}
              >
                <span>👉 Desliza a la derecha para eliminar serie</span>
              </div>

              {/* Set Actions: Add Set button (Quitar última removed as requested) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 4px 0',
                  borderTop: '1px solid var(--ion-color-step-100, #27272a)',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="primary"
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                    onClick={() => {
                      addSetToActiveWorkout(exIdx);
                      setToastMessage(`Serie #${(exercise.sets || []).length + 1} agregada a ${exercise.exerciseName}`);
                    }}
                  >
                    <IonIcon slot="start" icon={addOutline} />
                    + Serie
                  </IonButton>
                </div>

                <IonBadge color="medium" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {(exercise.sets || []).filter((s) => s.completed).length} de {(exercise.sets || []).length} completadas
                </IonBadge>
              </div>
            </IonCardContent>
          )}
        </IonCard>
      );
    })}

        {/* Button to Add Exercise to Current Active Workout */}
        <IonCard
          button
          onClick={() => setIsCatalogOpen(true)}
          style={{
            margin: '0 0 20px',
            borderRadius: '16px',
            border: '2px dashed var(--ion-color-primary)',
            boxShadow: 'none',
            background: 'rgba(56, 128, 255, 0.06)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <IonCardContent style={{ padding: '18px 16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: 'var(--ion-color-primary)',
              }}
            >
              <IonIcon icon={addCircleOutline} style={{ fontSize: '1.7rem' }} />
              <strong style={{ fontSize: '1.1rem' }}>+ Agregar Ejercicio a la Sesión</strong>
            </div>
            <IonText color="medium">
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
                Explora el catálogo con GIFs o crea un ejercicio personalizado
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Bottom Finish Action */}
        <div style={{ margin: '10px 8px 30px' }}>
          <IonButton
            expand="block"
            size="large"
            color="success"
            style={{ borderRadius: '14px', fontWeight: 700 }}
            onClick={handleOpenFinishAlert}
          >
            <IonIcon slot="start" icon={trophyOutline} />
            Finalizar Entrenamiento
          </IonButton>
        </div>
      </IonContent>

      {/* Sticky Bottom Footer: Complete next set button */}
      <IonFooter className="ion-no-border" style={{ background: '#101318', borderTop: '1px solid #1e2636' }}>
        <div style={{ padding: '10px 16px env(safe-area-inset-bottom, 12px)' }}>
          {nextPendingSet ? (
            <button
              type="button"
              onClick={() => handleToggleSet(nextPendingSet.exerciseIndex, nextPendingSet.setIndex)}
              style={{
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                boxShadow: '0 4px 18px rgba(37, 99, 235, 0.45)',
              }}
            >
              <IonIcon icon={checkmarkCircle} style={{ fontSize: '1.4rem' }} />
              <span>
                Terminar Serie #{nextPendingSet.setNumber} • {nextPendingSet.exerciseName}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenFinishAlert}
              style={{
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
              }}
            >
              <IonIcon icon={trophyOutline} style={{ fontSize: '1.4rem' }} />
              <span>¡Todas las series listas! Finalizar</span>
            </button>
          )}
        </div>
      </IonFooter>
        </>
      ) : (
        <div style={{ background: '#101318', height: '100%', width: '100%' }} />
      )}

      {/* Exercise Catalog Modal */}
      <ExerciseCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectExercise={handleSelectExerciseFromCatalog}
      />

      {/* Alert to Confirm Delete Exercise */}
      <IonAlert
        isOpen={exerciseIndexToDelete !== null}
        onDidDismiss={() => setExerciseIndexToDelete(null)}
        header="¿Quitar ejercicio de la rutina?"
        message={
          exerciseIndexToDelete !== null && activeWorkout?.exercises?.[exerciseIndexToDelete]
            ? `¿Deseas quitar "${activeWorkout.exercises[exerciseIndexToDelete].exerciseName}" de este entrenamiento en curso?`
            : '¿Deseas quitar este ejercicio de la sesión en curso?'
        }
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Quitar',
            role: 'destructive',
            handler: () => {
              if (exerciseIndexToDelete !== null) {
                removeExerciseFromActiveWorkout(exerciseIndexToDelete);
                setExerciseIndexToDelete(null);
                setToastMessage('Ejercicio quitado de la sesión');
              }
            },
          },
        ]}
      />

      {/* Alert to Confirm Finish with Option to Sync Routine */}
      <IonAlert
        isOpen={showFinishAlert}
        onDidDismiss={handleCloseFinishAlert}
        header="¿Finalizar entrenamiento?"
        message={`Completaste ${completedSetsCount} de ${totalSetsCount} series en ${formatTime(
          finishSnapshotSeconds ?? elapsedSeconds
        )}. ¡Gran trabajo!`}
        inputs={[
          {
            name: 'syncRoutine',
            type: 'checkbox',
            label: 'Guardar ejercicios y series en la rutina original',
            value: 'sync',
            checked: syncRoutineChecked,
            handler: (input: any) => {
              setSyncRoutineChecked(input.checked !== undefined ? input.checked : !syncRoutineChecked);
            },
          },
        ]}
        buttons={[
          {
            text: 'Continuar entrenando',
            role: 'cancel',
            handler: handleCloseFinishAlert,
          },
          {
            text: '¡Guardar sesión!',
            handler: (data) => {
              const shouldSync = Array.isArray(data)
                ? data.includes('sync')
                : typeof data === 'object' && data !== null
                ? (data as any).syncRoutine === true || (data as any).syncRoutine === 'sync'
                : syncRoutineChecked;

              if (!activeWorkout) {
                handleCloseFinishAlert();
                onClose();
                return;
              }

              const finalDurationSecs = finishSnapshotSeconds ?? elapsedSeconds;

              const finishedSession = finishActiveWorkout(undefined, shouldSync);
              const currentId = finishedSession?.id || activeWorkout.id;

              // Build snapshot summary before ending activeWorkout
              const summary: SessionSummary = {
                sessionId: currentId,
                routineName: activeWorkout.routineName || 'Entrenamiento',
                durationFormatted: formatTime(finalDurationSecs),
                totalSets: totalSetsCount,
                completedSets: completedSetsCount,
                totalVolumeKg: (activeWorkout.exercises || []).reduce((acc, ex) => {
                  let exVol = 0;
                  (ex.sets || []).forEach((s) => {
                    if (s.completed && s.actualReps && s.actualWeightKg) {
                      exVol += s.actualReps * s.actualWeightKg;
                    }
                  });
                  return acc + exVol;
                }, 0),
                exercises: (activeWorkout.exercises || []).map((ex) => ({
                  name: ex.exerciseName || 'Ejercicio',
                  completedSetsCount: (ex.sets || []).filter((s) => s.completed).length,
                  totalSetsCount: (ex.sets || []).length,
                  sets: (ex.sets || []).map((s) => ({
                    setNumber: s.setNumber,
                    weight: s.actualWeightKg,
                    reps: s.actualReps,
                    duration: s.actualDurationSeconds,
                  })),
                })),
              };

              handleCloseFinishAlert();
              setSessionSummary(summary);
              setRedirectSeconds(30);
            },
          },
        ]}
      />

      {/* Alert to Confirm Cancel */}
      <IonAlert
        isOpen={showCancelAlert}
        onDidDismiss={() => setShowCancelAlert(false)}
        header="¿Descartar sesión?"
        message="Se perderá el progreso de la sesión actual sin guardar."
        buttons={[
          {
            text: 'Seguir aquí',
            role: 'cancel',
          },
          {
            text: 'Descartar',
            role: 'destructive',
            handler: handleConfirmCancel,
          },
        ]}
      />

      {/* Feedback Toast */}
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ''}
        duration={2200}
        onDidDismiss={() => setToastMessage(null)}
        color="dark"
        position="bottom"
      />

      {/* Lbs to Kg Converter Modal */}
      <WeightConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        initialKg={selectedWeightTarget ? selectedWeightTarget.currentKg : undefined}
        targetInputDescription={
          selectedWeightTarget
            ? `${selectedWeightTarget.exerciseName} - Serie #${selectedWeightTarget.setNumber}`
            : undefined
        }
        onApplyKg={
          selectedWeightTarget
            ? (kg) => {
                const target = selectedWeightTarget;
                handleUpdateSetValue(target.exIdx, target.setIdx, { actualWeightKg: kg });
                setToastMessage(
                  `Peso ${kg} kg aplicado a Serie #${target.setNumber} (${target.exerciseName})`
                );
              }
            : undefined
        }
      />

      {/* Rest Countdown Modal */}
      <IonModal
        isOpen={restSecondsLeft !== null && restSecondsLeft > 0}
        backdropDismiss={false}
        onDidDismiss={() => setRestSecondsLeft(null)}
        style={{
          ['--max-width' as any]: '340px',
          ['--height' as any]: 'auto',
          ['--border-radius' as any]: '24px',
        }}
      >
        <div
          style={{
            background: '#161b24',
            padding: '24px 20px',
            color: '#f8fafc',
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px solid #232c3d',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={timerOutline} style={{ fontSize: '1.4rem', color: '#eab308' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Descanso entre series</span>
            </div>
            <button
              type="button"
              onClick={() => setRestSecondsLeft(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem' }} />
            </button>
          </div>

          {/* Countdown display */}
          <div style={{ margin: '14px 0 10px' }}>
            <div
              style={{
                fontSize: '3.6rem',
                fontWeight: 900,
                color: '#eab308',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {restSecondsLeft}
              <span style={{ fontSize: '1.6rem', fontWeight: 700, marginLeft: '4px' }}>s</span>
            </div>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
              Recupérate para la próxima serie
            </p>
          </div>

          {/* Requirement 4: Next exercise and set preview */}
          {nextPendingSet && (
            <div
              style={{
                background: '#0d1117',
                border: '1.5px solid #233148',
                borderRadius: '16px',
                padding: '12px 14px',
                margin: '12px 0 16px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>👉 Siguiente serie:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {nextPendingSet.gifUrl && (
                  <ExerciseGif
                    gifUrl={nextPendingSet.gifUrl}
                    exerciseName={nextPendingSet.exerciseName}
                    size="small"
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {nextPendingSet.exerciseName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      marginTop: '2px',
                    }}
                  >
                    Serie #{nextPendingSet.setNumber} •{' '}
                    {nextPendingSet.mode === 'weight_reps'
                      ? `${
                          getWeightUnit(nextPendingSet.exerciseIndex) === 'lb'
                            ? Number(((nextPendingSet.weightKg || 0) * 2.20462).toFixed(1))
                            : nextPendingSet.weightKg || 0
                        } ${getWeightUnit(nextPendingSet.exerciseIndex)} × ${
                          nextPendingSet.reps || 0
                        } reps`
                      : nextPendingSet.mode === 'duration'
                      ? `${nextPendingSet.durationSeconds || 0}s`
                      : `${nextPendingSet.reps || 0} reps`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -5s and +5s adjustment buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setRestSecondsLeft((prev) => Math.max(0, (prev || 0) - 5))}
              style={{
                flex: 1,
                background: '#202736',
                border: '1.5px solid #334155',
                borderRadius: '12px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <IonIcon icon={removeOutline} style={{ fontSize: '1.15rem' }} />
              -5s
            </button>

            <button
              type="button"
              onClick={() => setRestSecondsLeft((prev) => (prev || 0) + 5)}
              style={{
                flex: 1,
                background: '#202736',
                border: '1.5px solid #334155',
                borderRadius: '12px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <IonIcon icon={addOutline} style={{ fontSize: '1.15rem' }} />
              +5s
            </button>
          </div>

          {/* Saltar descanso button */}
          <button
            type="button"
            onClick={() => setRestSecondsLeft(null)}
            style={{
              width: '100%',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '0.96rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            }}
          >
            Saltar descanso
          </button>
        </div>
      </IonModal>
    </IonModal>
  );
};
