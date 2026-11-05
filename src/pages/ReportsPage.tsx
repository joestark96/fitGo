import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonModal,
  IonButtons,
  IonButton,
  IonBadge,
  IonActionSheet,
  IonAlert,
  IonToast,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  ellipsisHorizontal,
  chevronDown,
  closeOutline,
  arrowBack,
  chevronBack,
  chevronForward,
  repeatOutline,
  copyOutline,
  trashOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { MuscleHeatmap } from '../components/MuscleHeatmap';
import { WeightQuickRegisterModal } from '../components/WeightQuickRegisterModal';
import { WorkoutPlayerModal } from '../components/WorkoutPlayerModal';
import { WorkoutSession, Routine } from '../types';
import { getStartOfWeek, getOrderedWeekDayNames } from '../services/storage';

export const ReportsPage: React.FC = () => {
  const {
    workoutSessions,
    weightRecords,
    profile,
    saveWeightRecord,
    saveRoutine,
    routines,
    startWorkout,
    deleteWorkoutSession,
    saveProfile,
  } = useApp();

  const startDay = profile?.weekStartDay !== undefined ? profile.weekStartDay : 1;

  // Timeframe selector for muscle heatmap
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('week');
  const [showTimeframeSheet, setShowTimeframeSheet] = useState<boolean>(false);

  // Calendar / Historial modal
  const [showAllWorkoutsModal, setShowAllWorkoutsModal] = useState<boolean>(false);

  // Month navigation in calendar
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    if (workoutSessions.length > 0) {
      const d = new Date(workoutSessions[0].date || workoutSessions[0].completedAt || Date.now());
      return d.getFullYear();
    }
    return new Date().getFullYear();
  });

  const [calendarMonth, setCalendarMonth] = useState<number>(() => {
    if (workoutSessions.length > 0) {
      const d = new Date(workoutSessions[0].date || workoutSessions[0].completedAt || Date.now());
      return d.getMonth();
    }
    return new Date().getMonth();
  });

  // Session detail modal
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<WorkoutSession | null>(null);

  // 3-dots actions & modals
  const [selectedSessionForAction, setSelectedSessionForAction] = useState<WorkoutSession | null>(null);
  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
  const [showSaveNewAlert, setShowSaveNewAlert] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Workout Player modal (for "Repetir rutina")
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);

  // Weight entry modal
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);

  // Helper: Volume calculation for any workout session
  const calculateSessionVolume = (session: WorkoutSession): number => {
    let vol = 0;
    session.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        if (s.completed && s.actualReps && s.actualWeightKg) {
          vol += s.actualReps * s.actualWeightKg;
        }
      });
    });
    return vol;
  };

  // Helper: Format duration
  const formatSessionDuration = (mins?: number): string => {
    if (!mins) return '00:00';
    const totalSec = Math.round(mins * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper: Format date & time
  const formatSessionDateTime = (dateStr?: string) => {
    if (!dateStr) return { timeStr: '--:--', dateStr: '--' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { timeStr: '--:--', dateStr: dateStr };
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dateFormatted = `${d.getDate()} ${months[d.getMonth()]}`;
    return { timeStr, dateStr: dateFormatted };
  };

  // =========================================================================
  // CARD 1: TOTAL STATS (Calculated directly from real saved workoutSessions)
  // =========================================================================
  const totalWorkouts = workoutSessions.length;
  const totalMinutes = Math.round(
    workoutSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  );
  const totalVolumeKg = workoutSessions.reduce((acc, s) => acc + calculateSessionVolume(s), 0);
  const totalVolumeFormatted = useMemo(() => {
    if (totalVolumeKg >= 1000) {
      return `${(totalVolumeKg / 1000).toFixed(2)}K`;
    }
    return `${totalVolumeKg}`;
  }, [totalVolumeKg]);

  // Dynamically calculate the last 8 calendar weeks ending at current week
  const weeklyDistribution = useMemo(() => {
    const weeks: { labelDay: string; labelMonth: string; count: number; weekStart: Date; weekEnd: Date }[] = [];

    let refDate = new Date();
    if (workoutSessions.length > 0) {
      const latestDate = new Date(workoutSessions[0].date || workoutSessions[0].completedAt || Date.now());
      if (latestDate > refDate) {
        refDate = latestDate;
      }
    }

    // Start day of reference week based on profile preference
    const currentWeekStart = getStartOfWeek(refDate, startDay);
    currentWeekStart.setHours(0, 0, 0, 0);

    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    for (let i = 7; i >= 0; i--) {
      const wStart = new Date(currentWeekStart);
      wStart.setDate(currentWeekStart.getDate() - i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 7);

      const count = workoutSessions.filter((s) => {
        const d = new Date(s.date || s.completedAt || s.startedAt);
        return d >= wStart && d < wEnd;
      }).length;

      weeks.push({
        labelDay: `${wStart.getDate()}`,
        labelMonth: monthNames[wStart.getMonth()],
        count,
        weekStart: wStart,
        weekEnd: wEnd,
      });
    }

    return weeks;
  }, [workoutSessions, startDay]);

  const maxWeeklyCount = useMemo(() => {
    const maxVal = Math.max(...weeklyDistribution.map((w) => w.count), 0);
    return Math.max(maxVal, 3);
  }, [weeklyDistribution]);

  // =========================================================================
  // LOCAL DATE HELPERS (Prevents timezone UTC shifts)
  // =========================================================================
  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // =========================================================================
  // CARD 2: "ESTA SEMANA"
  // =========================================================================
  const weekDaysInfo = useMemo(() => {
    const today = new Date();
    const weekStart = getStartOfWeek(today, startDay);
    const orderedDayNames = getOrderedWeekDayNames(startDay);

    return orderedDayNames.map((dayItem, idx) => {
      const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + idx);
      const dayNum = d.getDate();
      const isToday = toLocalDateKey(d) === toLocalDateKey(today);

      const dayKey = toLocalDateKey(d);
      const dayWorkouts = workoutSessions.filter((s) => {
        const sDate = new Date(s.date || s.completedAt || s.startedAt);
        return !isNaN(sDate.getTime()) && toLocalDateKey(sDate) === dayKey;
      });
      const hasWorkout = dayWorkouts.length > 0;

      return {
        shortName: dayItem.short,
        dayNum,
        dateObj: d,
        isToday,
        hasWorkout,
      };
    });
  }, [workoutSessions, startDay]);

  const { todayMinutes, weeklyAverageMinutes } = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());
    const todaySessions = workoutSessions.filter((s) => {
      const sDate = new Date(s.date || s.completedAt || s.startedAt);
      return !isNaN(sDate.getTime()) && toLocalDateKey(sDate) === todayKey;
    });
    const todayMins = Math.round(todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0));

    // Weekly average
    const now = new Date();
    const weekStart = getStartOfWeek(now, startDay);
    const weekSessions = workoutSessions.filter((s) => {
      const d = new Date(s.date || s.completedAt || s.startedAt);
      return !isNaN(d.getTime()) && d >= weekStart;
    });
    const weekMins = weekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const weeklyAvg = Math.round(weekMins / 7);

    return {
      todayMinutes: todayMins,
      weeklyAverageMinutes: weeklyAvg,
    };
  }, [workoutSessions, startDay]);

  // Open calendar directly when user taps any day in "Esta semana"
  const handleOpenCalendarForDay = (d?: Date) => {
    if (d) {
      setCalendarYear(d.getFullYear());
      setCalendarMonth(d.getMonth());
    } else if (workoutSessions.length > 0) {
      const latest = new Date(workoutSessions[0].date || workoutSessions[0].completedAt || Date.now());
      setCalendarYear(latest.getFullYear());
      setCalendarMonth(latest.getMonth());
    }
    setShowAllWorkoutsModal(true);
  };

  // =========================================================================
  // CARD 3: FRECUENCIA DE EJERCICIO (Muscle Heatmap)
  // =========================================================================
  const timeframeLabel = useMemo(() => {
    if (timeframe === 'month') return 'Este mes';
    if (timeframe === 'year') return 'Este año';
    if (timeframe === 'all') return 'Todo el tiempo';
    return 'Esta semana';
  }, [timeframe]);

  const timeframeMuscleVolumes: Record<string, number> = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeframe === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
    } else {
      startDate = new Date(0); // All time
    }

    const volumes: Record<string, number> = {
      pecho: 0,
      espalda: 0,
      piernas: 0,
      hombros: 0,
      brazos: 0,
      core: 0,
    };

    workoutSessions.forEach((s) => {
      const sDate = new Date(s.date || s.completedAt || s.startedAt);
      if (sDate >= startDate) {
        s.exercises?.forEach((ex) => {
          // Identify muscle group from exercise id or name
          const lowerName = ex.exerciseName.toLowerCase();
          let group = 'pecho';
          if (lowerName.includes('espalda') || lowerName.includes('remo') || lowerName.includes('jalón') || lowerName.includes('dominada')) {
            group = 'espalda';
          } else if (lowerName.includes('pierna') || lowerName.includes('prensa') || lowerName.includes('sentadilla') || lowerName.includes('femoral') || lowerName.includes('cuádriceps') || lowerName.includes('gemelos')) {
            group = 'piernas';
          } else if (lowerName.includes('hombro') || lowerName.includes('militar') || lowerName.includes('lateral') || lowerName.includes('pájaro') || lowerName.includes('deltoides')) {
            group = 'hombros';
          } else if (lowerName.includes('bíceps') || lowerName.includes('tríceps') || lowerName.includes('brazo') || lowerName.includes('curl') || lowerName.includes('fondos')) {
            group = 'brazos';
          } else if (lowerName.includes('core') || lowerName.includes('abdomen') || lowerName.includes('plancha') || lowerName.includes('abdominal')) {
            group = 'core';
          }

          let exVol = 0;
          ex.sets?.forEach((st) => {
            if (st.completed && st.actualReps && st.actualWeightKg) {
              exVol += st.actualReps * st.actualWeightKg;
            }
          });
          volumes[group] = (volumes[group] || 0) + exVol;
        });
      }
    });

    return volumes;
  }, [workoutSessions, timeframe]);

  // =========================================================================
  // CARD 4: HISTORIAL (Latest workout)
  // =========================================================================
  const latestWorkout = workoutSessions.length > 0 ? workoutSessions[0] : null;
  const latestWorkoutVolume = latestWorkout ? calculateSessionVolume(latestWorkout) : 0;
  const latestWorkoutDateTime = formatSessionDateTime(latestWorkout?.completedAt || latestWorkout?.date);
  const latestWorkoutDuration = formatSessionDuration(latestWorkout?.durationMinutes);

  // =========================================================================
  // CARD 5: MI PESO
  // =========================================================================
  const currentWeightKg = useMemo(() => {
    if (weightRecords && weightRecords.length > 0) {
      return weightRecords[0].weightKg;
    }
    return profile?.targetWeight || 0;
  }, [weightRecords, profile]);

  const weightDiff30Days = useMemo(() => {
    if (weightRecords.length >= 2) {
      const diff = weightRecords[0].weightKg - weightRecords[weightRecords.length - 1].weightKg;
      return Number(diff.toFixed(1));
    }
    return 0.0;
  }, [weightRecords]);

  // =========================================================================
  // ACTIONS: 3 PUNTOS (Repetir rutina, Guardar como nuevo, Eliminar)
  // =========================================================================
  const handleOpenActionMenu = (session: WorkoutSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSessionForAction(session);
    setShowActionSheet(true);
  };

  const handleRepeatRoutine = (session: WorkoutSession) => {
    // 1. Try to find the original routine
    let routine = routines.find(
      (r) => r.id === session.routineId || r.name.toLowerCase() === session.routineName.toLowerCase()
    );

    // 2. If not found, reconstruct routine from session exercises
    if (!routine) {
      routine = {
        id: session.routineId || 'rep-' + Date.now(),
        name: session.routineName,
        exercises: (session.exercises || []).map((e, idx) => ({
          id: 'r-ex-' + Date.now() + '-' + idx,
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          mode: e.mode || 'weight_reps',
          targetSets: e.sets?.length || 3,
          targetReps: e.sets?.[0]?.actualReps || 10,
          targetWeightKg: e.sets?.[0]?.actualWeightKg,
          targetDurationSeconds: e.sets?.[0]?.actualDurationSeconds,
          restSeconds: 60,
          gifUrl: e.gifUrl,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // 3. Start workout & open player modal
    startWorkout(routine);
    setShowAllWorkoutsModal(false);
    setTimeout(() => {
      setIsPlayerOpen(true);
    }, 150);
  };

  const handleSaveAsNewRoutine = (name?: string) => {
    if (!selectedSessionForAction) return;
    const finalName = name?.trim() || `${selectedSessionForAction.routineName} (Copia)`;
    const newRoutine: Routine = {
      id: 'routine-' + Date.now(),
      name: finalName,
      description: `Creada desde el entrenamiento del ${formatSessionDateTime(selectedSessionForAction.date).dateStr}`,
      exercises: (selectedSessionForAction.exercises || []).map((e, idx) => ({
        id: 'r-ex-' + Date.now() + '-' + idx,
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        mode: e.mode || 'weight_reps',
        targetSets: e.sets?.length || 3,
        targetReps: e.sets?.[0]?.actualReps || 10,
        targetWeightKg: e.sets?.[0]?.actualWeightKg,
        targetDurationSeconds: e.sets?.[0]?.actualDurationSeconds,
        restSeconds: 60,
        gifUrl: e.gifUrl,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRoutine(newRoutine);
    setToastMessage(`Rutina "${finalName}" guardada en Ejercicios.`);
  };

  // =========================================================================
  // CALENDAR MODAL: MONTH VIEW & ROUTINES OF THE MONTH
  // =========================================================================
  const MONTH_NAMES_ES = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];

  const daysInCalendarMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday

  // Previous month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  // Next month navigation
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Workout sessions for current calendar month
  const monthSessions = useMemo(() => {
    return workoutSessions.filter((s) => {
      const d = new Date(s.date || s.completedAt || s.startedAt);
      return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
    });
  }, [workoutSessions, calendarYear, calendarMonth]);

  // Group all workouts of the month by week (Sunday to Saturday), matching the reference design
  interface MonthWeekGroup {
    weekKey: string;
    startDateFormatted: string; // e.g. "25 oct"
    endDateFormatted: string;   // e.g. "31 oct"
    yearFormatted: string;      // e.g. "2026"
    workoutsCount: number;
    sessions: WorkoutSession[];
  }

  const monthWeeksGrouped = useMemo<MonthWeekGroup[]>(() => {
    if (monthSessions.length === 0) return [];

    const monthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const groupsMap = new Map<string, { weekStart: Date; weekEnd: Date; sessions: WorkoutSession[] }>();

    monthSessions.forEach((session) => {
      const d = new Date(session.date || session.completedAt || session.startedAt);
      if (isNaN(d.getTime())) return;

      // Find start day of this week
      const weekStart = getStartOfWeek(d, startDay);
      weekStart.setHours(0, 0, 0, 0);

      // End day of this week (+6 days)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekKey = toLocalDateKey(weekStart);

      if (!groupsMap.has(weekKey)) {
        groupsMap.set(weekKey, {
          weekStart,
          weekEnd,
          sessions: [],
        });
      }

      groupsMap.get(weekKey)!.sessions.push(session);
    });

    // Sort weeks descending (most recent week first)
    const sortedGroups = Array.from(groupsMap.entries())
      .sort((a, b) => b[1].weekStart.getTime() - a[1].weekStart.getTime())
      .map(([weekKey, data]) => {
        // Sort sessions in this week descending
        const sortedSessions = [...data.sessions].sort((sA, sB) => {
          const tA = new Date(sA.date || sA.completedAt || 0).getTime();
          const tB = new Date(sB.date || sB.completedAt || 0).getTime();
          return tB - tA;
        });

        return {
          weekKey,
          startDateFormatted: `${data.weekStart.getDate()} ${monthsShort[data.weekStart.getMonth()]}`,
          endDateFormatted: `${data.weekEnd.getDate()} ${monthsShort[data.weekEnd.getMonth()]}`,
          yearFormatted: `${data.weekStart.getFullYear()}`,
          workoutsCount: sortedSessions.length,
          sessions: sortedSessions,
        };
      });

    return sortedGroups;
  }, [monthSessions]);

  // Calendar dates with workout lookup set
  const workoutDaysSet = useMemo(() => {
    const set = new Set<number>();
    monthSessions.forEach((s) => {
      const d = new Date(s.date || s.completedAt || s.startedAt);
      set.add(d.getDate());
    });
    return set;
  }, [monthSessions]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="fit-navbar" style={{ ['--background' as any]: '#101318' }}>
          <IonTitle
            style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              paddingLeft: '16px',
            }}
          >
            INFORME
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ ['--background' as any]: '#101318' }}>
        <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto', color: '#f8fafc' }}>
          
          {/* ========================================================= */}
          {/* ===================== CARD 1: TOTAL ===================== */}
          {/* ========================================================= */}
          <div style={{ marginBottom: '22px' }}>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 10px 4px',
                letterSpacing: '-0.01em',
              }}
            >
              Total
            </h2>

            <div
              style={{
                background: '#161b24',
                borderRadius: '16px',
                padding: '20px 18px',
                border: '1px solid #232c3d',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* 3 Metrics Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 500, marginBottom: '5px' }}>
                    Entrenamientos
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {totalWorkouts}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 500, marginBottom: '5px' }}>
                    Tiempo(min)
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {totalMinutes}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 500, marginBottom: '5px' }}>
                    Volumen(kg)
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {totalVolumeFormatted}
                  </div>
                </div>
              </div>

              {/* Subheader */}
              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Entrenamientos por semana
              </div>

              {/* Weekly Bar Chart */}
              <div
                style={{
                  background: '#10141c',
                  borderRadius: '12px',
                  padding: '16px 8px 10px',
                  border: '1px solid #1c2433',
                }}
              >
                <svg
                  viewBox="0 0 320 155"
                  style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="barBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Dashed Gridlines */}
                  <text x="14" y="29" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
                    {maxWeeklyCount}
                  </text>
                  <line x1="26" y1="26" x2="310" y2="26" stroke="#232d3d" strokeDasharray="3 3" strokeWidth="1" />

                  <text x="14" y="64" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
                    {Math.round((maxWeeklyCount * 2) / 3)}
                  </text>
                  <line x1="26" y1="61" x2="310" y2="61" stroke="#232d3d" strokeDasharray="3 3" strokeWidth="1" />

                  <text x="14" y="99" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
                    {Math.round(maxWeeklyCount / 3)}
                  </text>
                  <line x1="26" y1="96" x2="310" y2="96" stroke="#232d3d" strokeDasharray="3 3" strokeWidth="1" />

                  {/* Baseline y = 120 */}
                  <line x1="26" y1="120" x2="310" y2="120" stroke="#1e2736" strokeWidth="1" />

                  {/* Render 8 Weekly Bars */}
                  {weeklyDistribution.map((item, idx) => {
                    const colWidth = 280 / 8;
                    const colCenter = 30 + idx * colWidth + colWidth / 2;
                    const barWidth = 8;
                    const baselineY = 120;

                    const barHeight = (item.count / maxWeeklyCount) * 94;
                    const barTopY = baselineY - barHeight;

                    return (
                      <g key={idx}>
                        {item.count > 0 && (
                          <>
                            <rect
                              x={colCenter - barWidth / 2}
                              y={barTopY}
                              width={barWidth}
                              height={barHeight}
                              rx="3"
                              fill="url(#barBlueGradient)"
                            />
                            <text
                              x={colCenter}
                              y={barTopY - 5}
                              fill="#f8fafc"
                              fontSize="11"
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              {item.count}
                            </text>
                          </>
                        )}

                        <text
                          x={colCenter}
                          y="134"
                          fill="#64748b"
                          fontSize="8.5"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {item.labelDay}
                        </text>
                        <text
                          x={colCenter}
                          y="145"
                          fill="#475569"
                          fontSize="7"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {item.labelMonth}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ================= CARD 2: ESTA SEMANA =================== */}
          {/* ========================================================= */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 4px 10px' }}>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Esta semana
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Inicia:</span>
                <IonSelect
                  value={startDay}
                  interface="popover"
                  onIonChange={(e) => {
                    const newDay = Number(e.detail.value);
                    if (profile) {
                      saveProfile({ ...profile, weekStartDay: newDay });
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    color: '#60a5fa',
                    fontWeight: 700,
                    padding: '2px 8px',
                    background: '#10141c',
                    borderRadius: '8px',
                    border: '1px solid #1c2433',
                  }}
                >
                  <IonSelectOption value={1}>Lunes</IonSelectOption>
                  <IonSelectOption value={0}>Domingo</IonSelectOption>
                  <IonSelectOption value={2}>Martes</IonSelectOption>
                  <IonSelectOption value={3}>Miércoles</IonSelectOption>
                  <IonSelectOption value={4}>Jueves</IonSelectOption>
                  <IonSelectOption value={5}>Viernes</IonSelectOption>
                  <IonSelectOption value={6}>Sábado</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <div
              style={{
                background: '#161b24',
                borderRadius: '16px',
                padding: '18px 14px',
                border: '1px solid #232c3d',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* 7 Day Badges Row - Tapping any day opens the Calendar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                {weekDaysInfo.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenCalendarForDay(d.dateObj)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        fontWeight: 500,
                        marginBottom: '8px',
                      }}
                    >
                      {d.shortName}
                    </span>

                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: d.isToday ? '#000000' : 'rgba(255, 255, 255, 0.04)',
                        color: d.isToday ? '#ffffff' : '#94a3b8',
                        fontWeight: d.isToday ? 800 : 500,
                        fontSize: '0.88rem',
                        border: d.isToday ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'relative',
                        boxShadow: d.isToday ? '0 0 12px rgba(59, 130, 246, 0.35)' : 'none',
                      }}
                    >
                      {d.dayNum}

                      {/* Blue Dot if workout completed on this day */}
                      {d.hasWorkout && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            boxShadow: '0 0 6px #3b82f6',
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats below: Hoy(min) & Media semanal(min) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  borderTop: '1px solid #232c3d',
                  paddingTop: '16px',
                }}
              >
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Hoy(min)
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {todayMinutes}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #232c3d', paddingLeft: '16px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Media semanal(min)
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {weeklyAverageMinutes}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* =========== CARD 3: FRECUENCIA DE EJERCICIO ============= */}
          {/* ========================================================= */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '0 4px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Frecuencia de ejercicio
              </h2>

              <button
                type="button"
                onClick={() => setShowTimeframeSheet(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  fontWeight: 500,
                }}
              >
                <span>{timeframeLabel}</span>
                <IonIcon icon={chevronDown} style={{ fontSize: '0.8rem', color: '#94a3b8' }} />
              </button>
            </div>

            <div
              style={{
                background: '#161b24',
                borderRadius: '16px',
                padding: '16px 14px',
                border: '1px solid #232c3d',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <MuscleHeatmap
                muscleVolumes={timeframeMuscleVolumes}
                timeframe={timeframeLabel}
                defaultGender={profile?.gender === 'female' ? 'female' : 'male'}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* =================== CARD 4: HISTORIAL =================== */}
          {/* ========================================================= */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '0 4px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Historial
              </h2>

              <button
                type="button"
                onClick={() => handleOpenCalendarForDay()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Ver todos
              </button>
            </div>

            {/* Latest Workout Card */}
            {latestWorkout ? (
              <div
                onClick={() => setSelectedSessionDetail(latestWorkout)}
                style={{
                  background: '#161b24',
                  borderRadius: '16px',
                  padding: '18px',
                  border: '1px solid #232c3d',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.98rem' }}>
                    {latestWorkout.routineName}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleOpenActionMenu(latestWorkout, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    <IonIcon icon={ellipsisHorizontal} style={{ fontSize: '1.25rem' }} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <div
                      style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {latestWorkoutDateTime.timeStr}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                      {latestWorkoutDateTime.dateStr}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {latestWorkoutDuration}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                      Duración
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {latestWorkoutVolume}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                      Volumen
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#161b24',
                  borderRadius: '16px',
                  padding: '24px 18px',
                  textAlign: 'center',
                  border: '1px solid #232c3d',
                  color: '#94a3b8',
                  fontSize: '0.88rem',
                }}
              >
                Aún no has completado entrenamientos. ¡Comienza una rutina en la pestaña Ejercicios!
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* ==================== CARD 5: MI PESO ==================== */}
          {/* ========================================================= */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 10px 4px',
                letterSpacing: '-0.01em',
              }}
            >
              Mi peso
            </h2>

            <div
              style={{
                background: '#161b24',
                borderRadius: '16px',
                padding: '20px 18px',
                border: '1px solid #232c3d',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Header Row: Actual(kg), Diff, and solid blue REGISTRO button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Actual(kg)
                  </div>
                  <div
                    style={{
                      color: '#3b82f6',
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {currentWeightKg > 0 ? currentWeightKg : '--'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span>Últimos 30 días</span>
                    <span
                      style={{
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 700,
                      }}
                    >
                      ▲ {weightDiff30Days >= 0 ? weightDiff30Days.toFixed(1) : Math.abs(weightDiff30Days).toFixed(1)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWeightModal(true)}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '10px 24px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  REGISTRO
                </button>
              </div>

              {/* Month/Year Label */}
              <div
                style={{
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
              </div>

              {/* SVG Weight Line Chart */}
              <div style={{ width: '100%', overflow: 'visible' }}>
                <svg
                  viewBox="0 0 320 145"
                  style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                >
                  {/* Left Y-axis labels */}
                  <text x="14" y="24" fill="#64748b" fontSize="8.5" fontWeight="600" textAnchor="middle">
                    {(currentWeightKg + 0.6).toFixed(1)}
                  </text>
                  <line x1="26" y1="21" x2="310" y2="21" stroke="#1f2735" strokeDasharray="3 3" strokeWidth="1" />

                  <text x="14" y="58" fill="#64748b" fontSize="8.5" fontWeight="600" textAnchor="middle">
                    {(currentWeightKg + 0.2).toFixed(1)}
                  </text>
                  <line x1="26" y1="55" x2="310" y2="55" stroke="#1f2735" strokeDasharray="3 3" strokeWidth="1" />

                  <text x="14" y="92" fill="#64748b" fontSize="8.5" fontWeight="600" textAnchor="middle">
                    {(currentWeightKg - 0.2).toFixed(1)}
                  </text>
                  <line x1="26" y1="89" x2="310" y2="89" stroke="#1f2735" strokeDasharray="3 3" strokeWidth="1" />

                  <text x="14" y="126" fill="#64748b" fontSize="8.5" fontWeight="600" textAnchor="middle">
                    {(currentWeightKg - 0.6).toFixed(1)}
                  </text>
                  <line x1="26" y1="123" x2="310" y2="123" stroke="#1f2735" strokeDasharray="3 3" strokeWidth="1" />

                  {/* Dashed Target Line at current weight */}
                  <line x1="26" y1="72" x2="310" y2="72" stroke="#2a374a" strokeDasharray="3 3" strokeWidth="1.2" />

                  {/* Target bullseye & pill badge */}
                  {currentWeightKg > 0 && (
                    <>
                      <circle cx="170" cy="72" r="7" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.7" />
                      <circle cx="170" cy="72" r="3" fill="#3b82f6" />

                      <g transform="translate(156, 44)">
                        <rect x="0" y="0" width="28" height="15" rx="7.5" fill="#2563eb" />
                        <text x="14" y="11" fill="#ffffff" fontSize="8.5" fontWeight="800" textAnchor="middle">
                          {Math.round(currentWeightKg)}
                        </text>
                      </g>
                    </>
                  )}

                  {/* Bottom X-axis Date Markers */}
                  {[
                    { label: '29', x: 50 },
                    { label: '30', x: 90 },
                    { label: '31', x: 130 },
                    { label: '01', x: 170 },
                    { label: '02', x: 210 },
                    { label: '03', x: 250 },
                    { label: '04', x: 290 },
                  ].map((pt, i) => (
                    <text
                      key={i}
                      x={pt.x}
                      y="140"
                      fill="#64748b"
                      fontSize="8.5"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Action Sheet for Timeframe */}
        <IonActionSheet
          isOpen={showTimeframeSheet}
          onDidDismiss={() => setShowTimeframeSheet(false)}
          header="Seleccionar Período"
          buttons={[
            {
              text: 'Esta semana',
              role: timeframe === 'week' ? 'selected' : undefined,
              handler: () => setTimeframe('week'),
            },
            {
              text: 'Este mes',
              role: timeframe === 'month' ? 'selected' : undefined,
              handler: () => setTimeframe('month'),
            },
            {
              text: 'Este año',
              role: timeframe === 'year' ? 'selected' : undefined,
              handler: () => setTimeframe('year'),
            },
            {
              text: 'Todo el tiempo',
              role: timeframe === 'all' ? 'selected' : undefined,
              handler: () => setTimeframe('all'),
            },
            {
              text: 'Cancelar',
              role: 'cancel',
            },
          ]}
        />

        {/* ========================================================================= */}
        {/* MODAL: HISTORIAL CON CALENDARIO & RUTINAS DEL MES (Matching Screenshot)   */}
        {/* ========================================================================= */}
        <IonModal
          isOpen={showAllWorkoutsModal}
          onDidDismiss={() => setShowAllWorkoutsModal(false)}
        >
          <IonHeader>
            <IonToolbar className="fit-navbar" style={{ ['--background' as any]: '#101318' }}>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowAllWorkoutsModal(false)}>
                  <IonIcon icon={arrowBack} style={{ color: '#ffffff', fontSize: '1.4rem' }} />
                </IonButton>
              </IonButtons>
              <IonTitle
                style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.02em',
                }}
              >
                HISTORIAL
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent style={{ ['--background' as any]: '#101318' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              
              {/* TOP SECTION: CALENDARIO (Direct on dark background like reference) */}
              <div style={{ padding: '16px 14px 20px' }}>
                {/* Month navigation header: < OCTUBRE 2026 > */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    padding: '0 8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IonIcon icon={chevronBack} style={{ fontSize: '1.35rem' }} />
                  </button>

                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                    }}
                  >
                    {MONTH_NAMES_ES[calendarMonth]} {calendarYear}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IonIcon icon={chevronForward} style={{ fontSize: '1.35rem' }} />
                  </button>
                </div>

                {/* Weekday labels: Dom, Lun, Mar, Mié, Jue, Vie, Sáb */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}
                >
                  <span>Dom</span>
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                </div>

                {/* Days Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    rowGap: '10px',
                    textAlign: 'center',
                  }}
                >
                  {/* Empty cells before day 1 */}
                  {Array.from({ length: firstDayWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {/* Days 1 to daysInMonth */}
                  {Array.from({ length: daysInCalendarMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasWorkout = workoutDaysSet.has(day);

                    // Connected pill effect when consecutive workout days exist on the same row (like 30 & 31 in reference)
                    const colIndex = (firstDayWeekday + i) % 7;
                    const prevInRow = hasWorkout && colIndex > 0 && workoutDaysSet.has(day - 1);
                    const nextInRow = hasWorkout && colIndex < 6 && workoutDaysSet.has(day + 1);

                    return (
                      <div
                        key={day}
                        style={{
                          position: 'relative',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Left connector bar if previous day in row had a workout */}
                        {prevInRow && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              width: '50%',
                              height: '36px',
                              background: '#3b82f6',
                              zIndex: 1,
                            }}
                          />
                        )}

                        {/* Right connector bar if next day in row has a workout */}
                        {nextInRow && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              width: '50%',
                              height: '36px',
                              background: '#3b82f6',
                              zIndex: 1,
                            }}
                          />
                        )}

                        {/* Day circular badge */}
                        <div
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: hasWorkout
                              ? '#3b82f6'
                              : '#202530',
                            color: hasWorkout ? '#ffffff' : '#8a99ad',
                            fontWeight: hasWorkout ? 700 : 500,
                            fontSize: '0.9rem',
                            boxShadow: hasWorkout ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
                          }}
                        >
                          {day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM SECTION: RUTINAS DEL MES AGRUPADAS POR SEMANA (Matching screenshot 2) */}
              <div
                style={{
                  background: '#161b24',
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  padding: '22px 18px 40px',
                  border: '1px solid #232c3d',
                  borderBottom: 'none',
                  minHeight: '380px',
                  boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                {monthWeeksGrouped.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 10px', color: '#94a3b8', fontSize: '0.88rem' }}>
                    No hay entrenamientos registrados para este mes.
                  </div>
                ) : (
                  monthWeeksGrouped.map((group, groupIdx) => (
                    <div
                      key={group.weekKey}
                      style={{
                        marginBottom: groupIdx === monthWeeksGrouped.length - 1 ? '0' : '28px',
                      }}
                    >
                      {/* Week Subheader: Range & Count (matches screenshot: 25 oct - 31 oct \n 2026, and 3 \n Entrenamientos) */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px',
                        }}
                      >
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                            {group.startDateFormatted} - {group.endDateFormatted}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                            {group.yearFormatted}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '1.3rem',
                              lineHeight: 1,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {group.workoutsCount}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '3px' }}>
                            Entrenamientos
                          </div>
                        </div>
                      </div>

                      {/* Workout List for this week (Clean flat list matching screenshot 2) */}
                      <div>
                        {group.sessions.map((session, sIdx) => {
                          const vol = calculateSessionVolume(session);
                          const dt = formatSessionDateTime(session.completedAt || session.date);
                          const dur = formatSessionDuration(session.durationMinutes);

                          return (
                            <div
                              key={session.id}
                              onClick={() => setSelectedSessionDetail(session)}
                              style={{
                                padding: '16px 0',
                                cursor: 'pointer',
                                borderBottom: sIdx === group.sessions.length - 1 ? 'none' : '1px solid #1f2736',
                              }}
                            >
                              {/* Title and 3-dots */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '10px',
                                }}
                              >
                                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
                                  {session.routineName}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenActionMenu(session, e)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px 6px',
                                  }}
                                >
                                  <IonIcon icon={ellipsisHorizontal} style={{ fontSize: '1.3rem' }} />
                                </button>
                              </div>

                              {/* 3 Metrics: Time/Date, Duration, Volume */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                                <div>
                                  <div
                                    style={{
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      fontSize: '0.96rem',
                                      fontVariantNumeric: 'tabular-nums',
                                    }}
                                  >
                                    {dt.timeStr}
                                  </div>
                                  <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                                    {dt.dateStr}
                                  </div>
                                </div>

                                <div>
                                  <div
                                    style={{
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      fontSize: '0.96rem',
                                      fontVariantNumeric: 'tabular-nums',
                                    }}
                                  >
                                    {dur}
                                  </div>
                                  <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                                    Duración
                                  </div>
                                </div>

                                <div>
                                  <div
                                    style={{
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      fontSize: '0.96rem',
                                      fontVariantNumeric: 'tabular-nums',
                                    }}
                                  >
                                    {vol}
                                  </div>
                                  <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                                    Volumen
                                  </div>
                                </div>
                              </div>

                              {/* Badges for calories burned and steps if present */}
                              {(session.caloriesBurned !== undefined || session.steps !== undefined) && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                  {session.caloriesBurned !== undefined && (
                                    <span
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.12)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#f87171',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      🔥 {session.caloriesBurned} kcal
                                    </span>
                                  )}
                                  {session.steps !== undefined && (
                                    <span
                                      style={{
                                        background: 'rgba(56, 189, 248, 0.12)',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        color: '#38bdf8',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      👟 {session.steps.toLocaleString()} pasos
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </IonContent>
        </IonModal>

        {/* ========================================================================= */}
        {/* ACTION SHEET: 3 PUNTOS TOOLTIP (Repetir, Guardar como nuevo, Eliminar)    */}
        {/* ========================================================================= */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={selectedSessionForAction?.routineName || 'Opciones del Entrenamiento'}
          buttons={[
            {
              text: 'Repetir rutina',
              icon: repeatOutline,
              handler: () => {
                if (selectedSessionForAction) {
                  handleRepeatRoutine(selectedSessionForAction);
                }
              },
            },
            {
              text: 'Guardar como nuevo entrenamiento',
              icon: copyOutline,
              handler: () => {
                setShowSaveNewAlert(true);
              },
            },
            {
              text: 'Eliminar',
              icon: trashOutline,
              role: 'destructive',
              handler: () => {
                setShowDeleteAlert(true);
              },
            },
            {
              text: 'Cancelar',
              role: 'cancel',
            },
          ]}
        />

        {/* ALERT: Guardar como nuevo entrenamiento */}
        <IonAlert
          isOpen={showSaveNewAlert}
          onDidDismiss={() => setShowSaveNewAlert(false)}
          header="Guardar como nuevo entrenamiento"
          message="Ingresa un nombre para crear una nueva rutina a partir de este entrenamiento:"
          inputs={[
            {
              name: 'routineName',
              type: 'text',
              placeholder: 'Nombre de la nueva rutina',
              value: selectedSessionForAction ? `${selectedSessionForAction.routineName} (Copia)` : '',
            },
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Guardar',
              handler: (data) => {
                handleSaveAsNewRoutine(data.routineName);
              },
            },
          ]}
        />

        {/* ALERT: Confirmar eliminación */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="¿Eliminar entrenamiento?"
          message={`¿Estás seguro de que deseas eliminar "${selectedSessionForAction?.routineName}" del historial? Esta acción no se puede deshacer.`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: () => {
                if (selectedSessionForAction) {
                  deleteWorkoutSession(selectedSessionForAction.id);
                  setToastMessage('Entrenamiento eliminado del historial.');
                  setSelectedSessionForAction(null);
                }
              },
            },
          ]}
        />

        {/* Modal: Workout Session Details */}
        <IonModal
          isOpen={!!selectedSessionDetail}
          onDidDismiss={() => setSelectedSessionDetail(null)}
        >
          <IonHeader>
            <IonToolbar className="fit-navbar" style={{ ['--background' as any]: '#101318' }}>
              <IonTitle style={{ color: '#ffffff', fontWeight: 800 }}>
                {selectedSessionDetail?.routineName || 'Detalle del Entrenamiento'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setSelectedSessionDetail(null)}>
                  <IonIcon icon={closeOutline} style={{ color: '#94a3b8', fontSize: '1.5rem' }} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent style={{ ['--background' as any]: '#101318' }}>
            {selectedSessionDetail && (
              <div style={{ padding: '18px', maxWidth: '640px', margin: '0 auto', color: '#f8fafc' }}>
                <div
                  style={{
                    background: '#161b24',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid #232c3d',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Fecha y Hora
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                    {new Date(selectedSessionDetail.completedAt || selectedSessionDetail.date).toLocaleString('es-ES')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Duración</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
                        {formatSessionDuration(selectedSessionDetail.durationMinutes)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Volumen Total</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
                        {calculateSessionVolume(selectedSessionDetail)} kg
                      </div>
                    </div>
                    {selectedSessionDetail.caloriesBurned !== undefined && (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Calorías Quemadas</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>
                          🔥 {selectedSessionDetail.caloriesBurned} kcal
                        </div>
                      </div>
                    )}
                    {selectedSessionDetail.steps !== undefined && (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pasos Alcanzados</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                          👟 {selectedSessionDetail.steps.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedSessionDetail.notes && (
                    <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                      "{selectedSessionDetail.notes}"
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
                  Ejercicios Realizados
                </h3>

                {selectedSessionDetail.exercises?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedSessionDetail.exercises.map((ex, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#161b24',
                          borderRadius: '12px',
                          padding: '14px',
                          border: '1px solid #232c3d',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', marginBottom: '6px' }}>
                          {ex.exerciseName}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ex.sets?.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                background: '#10141c',
                                border: '1px solid #1e2636',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                color: '#94a3b8',
                              }}
                            >
                              S{s.setNumber}: {s.actualWeightKg}kg × {s.actualReps} reps
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Rutina completada con éxito.
                  </div>
                )}
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Modal: Workout Player (For "Repetir rutina") */}
        <WorkoutPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
        />

        {/* Modal: Quick Weight Register Bottom Sheet (matching reference design) */}
        <WeightQuickRegisterModal
          isOpen={showWeightModal}
          onClose={() => setShowWeightModal(false)}
          onSaved={(newRec) => {
            saveWeightRecord(newRec);
            setShowWeightModal(false);
            setToastMessage(`Peso de ${newRec.weightKg} kg guardado.`);
          }}
        />

        {/* Toast feedback */}
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2500}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
