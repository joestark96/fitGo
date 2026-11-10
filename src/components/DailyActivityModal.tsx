import React, { useState, useEffect, useMemo } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import {
  closeOutline,
  footstepsOutline,
  flameOutline,
  sparklesOutline,
  checkmarkCircle,
  refreshOutline,
  watchOutline,
  trophyOutline,
  timeOutline,
  navigateOutline,
} from 'ionicons/icons';
import { formatDateDDMMYYYY } from '../services/storage';

interface DailyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  currentSteps: number;
  currentCaloriesBurned: number;
  userWeightKg?: number;
  onSave: (steps?: number, caloriesBurned?: number) => void;
}

const STEP_PRESETS = [
  { label: 'Ligero', steps: 3000 },
  { label: 'Misión XP', steps: 5000 },
  { label: 'Activo', steps: 8000 },
  { label: 'Élite', steps: 10000 },
  { label: 'Atleta', steps: 15000 },
];

const WORKOUT_BURN_PRESETS = [
  { label: 'Caminata 30m', kcal: 140 },
  { label: 'Pesas 45m', kcal: 250 },
  { label: 'Cardio 30m', kcal: 300 },
  { label: 'Ciclismo', kcal: 280 },
  { label: 'HIIT Intenso', kcal: 420 },
];

export const DailyActivityModal: React.FC<DailyActivityModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  currentSteps,
  currentCaloriesBurned,
  userWeightKg = 72,
  onSave,
}) => {
  const [steps, setSteps] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [autoSyncCalories, setAutoSyncCalories] = useState<boolean>(false);

  // Estimate calories burned from steps adjusted by body weight
  const estimateCaloriesFromSteps = (stepCount: number, weightKg: number): number => {
    const safeWeight = weightKg > 30 ? weightKg : 72;
    return Math.round(stepCount * 0.04 * (safeWeight / 70));
  };

  useEffect(() => {
    if (isOpen) {
      setSteps(currentSteps || 0);
      setCaloriesBurned(currentCaloriesBurned || 0);
      // Enable auto-sync automatically if both start at 0 or if currentCalories matches step estimation
      const estimated = estimateCaloriesFromSteps(currentSteps || 0, userWeightKg);
      setAutoSyncCalories(
        (currentSteps === 0 && currentCaloriesBurned === 0) ||
          (currentSteps > 0 && Math.abs((currentCaloriesBurned || 0) - estimated) <= 15)
      );
    }
  }, [isOpen, currentSteps, currentCaloriesBurned, userWeightKg]);

  const estimatedStepCalories = useMemo(
    () => estimateCaloriesFromSteps(steps, userWeightKg),
    [steps, userWeightKg]
  );

  const handleStepsChange = (newSteps: number) => {
    const clamped = Math.max(0, Math.min(100000, Math.round(newSteps)));
    setSteps(clamped);
    if (autoSyncCalories) {
      setCaloriesBurned(estimateCaloriesFromSteps(clamped, userWeightKg));
    }
  };

  const handleCaloriesChange = (newCalories: number) => {
    const clamped = Math.max(0, Math.min(20000, Math.round(newCalories)));
    setCaloriesBurned(clamped);
    setAutoSyncCalories(false);
  };

  const handleAddWorkoutBurn = (extraKcal: number) => {
    setAutoSyncCalories(false);
    setCaloriesBurned((prev) => Math.max(0, prev + extraKcal));
  };

  const handleToggleAutoSync = () => {
    const next = !autoSyncCalories;
    setAutoSyncCalories(next);
    if (next) {
      setCaloriesBurned(estimateCaloriesFromSteps(steps, userWeightKg));
    }
  };

  const handleSave = () => {
    onSave(steps >= 0 ? steps : undefined, caloriesBurned >= 0 ? caloriesBurned : undefined);
    onClose();
  };

  // Derived metrics
  const distanceKm = (steps * 0.00075).toFixed(2);
  const walkingMinutes = Math.round(steps / 100);
  const missionUnlocked = steps >= 5000;
  const missionProgressPct = Math.min(100, Math.round((steps / 5000) * 100));

  // SVG Ring calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const ringProgress = Math.min(1, steps / stepGoal);
  const strokeDashoffset = circumference - ringProgress * circumference;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={
            {
              '--background': 'var(--ion-background-color, #0f172a)',
              paddingTop: '4px',
            } as React.CSSProperties
          }
        >
          <IonTitle style={{ fontWeight: 800, fontSize: '1.08rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={footstepsOutline} color="primary" />
              <span>Actividad & Pasos</span>
              <IonBadge
                color="primary"
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                {formatDateDDMMYYYY(selectedDate)}
              </IonBadge>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="medium">
              <IonIcon icon={closeOutline} style={{ fontSize: '1.5rem' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* HERO INTERACTIVE STEP RING CARD */}
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.95) 65%, rgba(239, 68, 68, 0.12) 100%)',
            borderRadius: '22px',
            padding: '18px 16px',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.25)',
            marginBottom: '16px',
          }}
        >
          {/* Goal selector pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6ee7b7',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Meta de Pasos Diaria
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[5000, 8000, 10000].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setStepGoal(g)}
                  style={{
                    background:
                      stepGoal === g ? 'rgba(16, 185, 129, 0.28)' : 'rgba(255, 255, 255, 0.06)',
                    border:
                      stepGoal === g
                        ? '1px solid #10b981'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                    color: stepGoal === g ? '#6ee7b7' : 'var(--ion-color-medium)',
                    borderRadius: '10px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {(g / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Circular Progress + Live Metrics */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            {/* Animated SVG Ring */}
            <div style={{ position: 'relative', width: '156px', height: '156px' }}>
              <svg width="156" height="156" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="78"
                  cy="78"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="78"
                  cy="78"
                  r={radius}
                  stroke={steps >= stepGoal ? '#10b981' : '#34d399'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.35s ease, stroke 0.3s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <IonIcon
                  icon={footstepsOutline}
                  style={{ fontSize: '1.35rem', color: '#34d399', marginBottom: '2px' }}
                />
                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.1,
                  }}
                >
                  {steps.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>
                  / {stepGoal.toLocaleString()} pasos
                </div>
                <div
                  style={{
                    marginTop: '3px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: steps >= stepGoal ? '#34d399' : '#94a3b8',
                  }}
                >
                  {Math.round((steps / stepGoal) * 100)}%
                </div>
              </div>
            </div>

            {/* Live Derived Stats Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
                minWidth: '135px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <IonIcon icon={navigateOutline} style={{ fontSize: '1.2rem', color: '#38bdf8' }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>
                    DISTANCIA EST.
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                    {distanceKm} km
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <IonIcon icon={timeOutline} style={{ fontSize: '1.2rem', color: '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>
                    TIEMPO ACTIVO
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                    ~{walkingMinutes} min
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <IonIcon icon={flameOutline} style={{ fontSize: '1.2rem', color: '#f87171' }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 600 }}>
                    QUEMADAS TOTAL
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fca5a5' }}>
                    {caloriesBurned} kcal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Daily Mission Live Status Bar */}
          <div
            style={{
              marginTop: '14px',
              padding: '9px 12px',
              borderRadius: '12px',
              background: missionUnlocked
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(99, 102, 241, 0.14)',
              border: missionUnlocked
                ? '1px solid rgba(16, 185, 129, 0.45)'
                : '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon
                icon={missionUnlocked ? checkmarkCircle : trophyOutline}
                style={{
                  fontSize: '1.15rem',
                  color: missionUnlocked ? '#34d399' : '#818cf8',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: missionUnlocked ? '#a7f3d0' : '#c7d2fe',
                }}
              >
                {missionUnlocked
                  ? '¡Misión Diaria de 5,000 pasos superada!'
                  : `Misión Diaria: ${(5000 - steps).toLocaleString()} pasos más para +50 XP (${missionProgressPct}%)`}
              </span>
            </div>
            <IonBadge
              style={{
                background: missionUnlocked ? '#10b981' : '#4f46e5',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '4px 7px',
                borderRadius: '8px',
              }}
            >
              +50 XP
            </IonBadge>
          </div>
        </div>

        {/* SECTION 1: INTERACTIVE STEP CONTROLS */}
        <div
          style={{
            background: 'var(--ion-card-background, rgba(30, 41, 59, 0.7))',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IonIcon icon={footstepsOutline} style={{ color: '#10b981', fontSize: '1.1rem' }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Ajuste Rápido de Pasos</span>
            </div>
            <button
              type="button"
              onClick={() => handleStepsChange(0)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ion-color-medium)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <IonIcon icon={refreshOutline} /> Reiniciar
            </button>
          </div>

          {/* Interactive Range Slider */}
          <div style={{ margin: '8px 0 14px' }}>
            <input
              type="range"
              min={0}
              max={25000}
              step={100}
              value={Math.min(25000, steps)}
              onChange={(e) => handleStepsChange(Number(e.target.value))}
              aria-label="Deslizador de pasos"
              style={{
                width: '100%',
                accentColor: '#10b981',
                height: '8px',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: 'var(--ion-color-medium)',
                marginTop: '4px',
              }}
            >
              <span>0</span>
              <span>5k (XP)</span>
              <span>10k</span>
              <span>15k</span>
              <span>25k+</span>
            </div>
          </div>

          {/* Quick +/- Step Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {[
              { label: '-500', delta: -500, negative: true },
              { label: '+500', delta: 500, negative: false },
              { label: '+1,000', delta: 1000, negative: false },
              { label: '+2,500', delta: 2500, negative: false },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleStepsChange(steps + btn.delta)}
                style={{
                  padding: '9px 4px',
                  borderRadius: '11px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  background: btn.negative
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(16, 185, 129, 0.15)',
                  border: btn.negative
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(16, 185, 129, 0.35)',
                  color: btn.negative ? '#cbd5e1' : '#6ee7b7',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Step Preset Chips */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              marginBottom: '12px',
            }}
          >
            {STEP_PRESETS.map((preset) => {
              const active = steps === preset.steps;
              return (
                <button
                  key={preset.steps}
                  type="button"
                  onClick={() => handleStepsChange(preset.steps)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: active ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#052e16' : 'var(--ion-text-color)',
                    border: active
                      ? '1px solid #10b981'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {preset.label} ({(preset.steps / 1000).toFixed(0)}k)
                </button>
              );
            })}
          </div>

          {/* Direct Smartwatch Step Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--ion-color-medium)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IonIcon icon={watchOutline} /> Pasos exactos:
            </span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={steps === 0 ? '' : steps}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                handleStepsChange(isNaN(val) ? 0 : val);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#34d399',
                fontWeight: 800,
                fontSize: '1.05rem',
                textAlign: 'right',
                width: '110px',
              }}
            />
          </div>
        </div>

        {/* SECTION 2: DYNAMIC CALORIES BURNED */}
        <div
          style={{
            background: 'var(--ion-card-background, rgba(30, 41, 59, 0.7))',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IonIcon icon={flameOutline} style={{ color: '#ef4444', fontSize: '1.1rem' }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Calorías Quemadas (kcal)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCaloriesChange(0)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ion-color-medium)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <IonIcon icon={refreshOutline} /> Reiniciar
            </button>
          </div>

          {/* Smart Auto-Estimate from Steps Banner */}
          <div
            onClick={handleToggleAutoSync}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              marginBottom: '12px',
              cursor: 'pointer',
              background: autoSyncCalories
                ? 'rgba(16, 185, 129, 0.14)'
                : 'rgba(255, 255, 255, 0.04)',
              border: autoSyncCalories
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon
                icon={sparklesOutline}
                style={{
                  color: autoSyncCalories ? '#34d399' : '#f59e0b',
                  fontSize: '1.15rem',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Calcular automáticamente según mis pasos
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)' }}>
                  Estimado para {steps.toLocaleString()} pasos (~{userWeightKg} kg):{' '}
                  <strong style={{ color: '#fca5a5' }}>{estimatedStepCalories} kcal</strong>
                </div>
              </div>
            </div>
            <IonBadge
              color={autoSyncCalories ? 'success' : 'medium'}
              style={{ fontSize: '0.68rem', padding: '4px 8px', borderRadius: '8px' }}
            >
              {autoSyncCalories ? 'AUTO ON' : 'USAR'}
            </IonBadge>
          </div>

          {/* Add Workout / Cardio Activity Chips */}
          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                fontSize: '0.73rem',
                color: 'var(--ion-color-medium)',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              Sumar actividad extra o cardio:
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              {WORKOUT_BURN_PRESETS.map((act) => (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => handleAddWorkoutBurn(act.kcal)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {act.label} (+{act.kcal})
                </button>
              ))}
            </div>
          </div>

          {/* Quick +/- Calorie Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {[
              { label: '-50 kcal', delta: -50, negative: true },
              { label: '+50 kcal', delta: 50, negative: false },
              { label: '+100 kcal', delta: 100, negative: false },
              { label: '+250 kcal', delta: 250, negative: false },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleCaloriesChange(caloriesBurned + btn.delta)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '11px',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  background: btn.negative
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: btn.negative
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(239, 68, 68, 0.35)',
                  color: btn.negative ? '#cbd5e1' : '#fca5a5',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Direct Smartwatch Calorie Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--ion-color-medium)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IonIcon icon={watchOutline} /> Calorías Smartwatch (kcal):
            </span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={caloriesBurned === 0 ? '' : caloriesBurned}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                handleCaloriesChange(isNaN(val) ? 0 : val);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f87171',
                fontWeight: 800,
                fontSize: '1.05rem',
                textAlign: 'right',
                width: '110px',
              }}
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <IonButton
          expand="block"
          onClick={handleSave}
          style={
            {
              '--background': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '--border-radius': '14px',
              fontWeight: 800,
              height: '50px',
              fontSize: '0.98rem',
              marginBottom: '12px',
            } as React.CSSProperties
          }
        >
          Guardar Actividad ({steps.toLocaleString()} pasos • {caloriesBurned} kcal)
        </IonButton>
      </IonContent>
    </IonModal>
  );
};
