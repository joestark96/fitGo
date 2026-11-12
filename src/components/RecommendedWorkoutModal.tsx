import React, { useState, useMemo } from 'react';
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
  IonCard,
  IonCardContent,
} from '@ionic/react';
import {
  closeOutline,
  sparklesOutline,
  barbellOutline,
  checkmarkCircle,
  refreshOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { ExerciseGif } from './ExerciseGif';
import { EquipmentType, RoutineExerciseConfig } from '../types';
import { ExerciseFocusFilter } from '../services/exerciseClassification';
import {
  generateRecommendedWorkout,
  MUSCLE_GROUP_LABELS,
} from '../services/recommendedWorkoutService';

interface RecommendedWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingExerciseIds?: string[];
  onApply: (payload: {
    exercises: RoutineExerciseConfig[];
    suggestedName: string;
    suggestedDescription: string;
    replaceExisting: boolean;
  }) => void;
}

const SELECTABLE_MUSCLES: ExerciseFocusFilter[] = [
  'pecho',
  'espalda',
  'piernas',
  'gluteos',
  'hombros',
  'brazos',
  'core',
  'cardio',
  'push',
  'pull',
  'tren_superior',
  'tren_inferior',
  'cuerpo_completo',
];

const EQUIPMENT_OPTIONS: { value: EquipmentType | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todo' },
  { value: 'mancuernas', label: 'Mancuernas' },
  { value: 'barra', label: 'Barra' },
  { value: 'maquina', label: 'Máquina' },
  { value: 'polea', label: 'Polea' },
  { value: 'bandas', label: 'Bandas' },
  { value: 'sin_equipo', label: 'Sin equipo' },
];

export const RecommendedWorkoutModal: React.FC<RecommendedWorkoutModalProps> = ({
  isOpen,
  onClose,
  existingExerciseIds = [],
  onApply,
}) => {
  const { exercises, workoutSessions, routines, profile } = useApp();
  const unit = profile?.preferredWeightUnit || 'kg';

  const [selectedMuscles, setSelectedMuscles] = useState<ExerciseFocusFilter[]>(['pecho', 'brazos']);
  const [totalExercises, setTotalExercises] = useState<number>(5);
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentType[]>([]);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [seedBump, setSeedBump] = useState<number>(0);

  const toggleMuscle = (muscle: ExerciseFocusFilter) => {
    setSelectedMuscles((prev) => {
      if (muscle === 'cuerpo_completo') {
        return prev.includes('cuerpo_completo') ? ['pecho', 'espalda'] : ['cuerpo_completo'];
      }
      const withoutFullBody = prev.filter((m) => m !== 'cuerpo_completo');
      if (withoutFullBody.includes(muscle)) {
        const next = withoutFullBody.filter((m) => m !== muscle);
        return next.length > 0 ? next : withoutFullBody;
      }
      return [...withoutFullBody, muscle];
    });
  };

  const toggleEquipment = (eq: EquipmentType | 'todos') => {
    if (eq === 'todos') {
      setSelectedEquipments([]);
      return;
    }
    setSelectedEquipments((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const generated = useMemo(() => {
    return generateRecommendedWorkout({
      selectedMuscles,
      exercises,
      workoutSessions,
      routines,
      totalExercises,
      equipmentFilter: selectedEquipments.length > 0 ? selectedEquipments : 'todos',
      excludeExerciseIds: replaceExisting ? [] : existingExerciseIds,
      variationSeed: seedBump,
    });
  }, [
    selectedMuscles,
    exercises,
    workoutSessions,
    routines,
    totalExercises,
    selectedEquipments,
    replaceExisting,
    existingExerciseIds,
    seedBump,
  ]);

  const formatWeight = (kg?: number) => {
    if (kg === undefined || kg === null) return '';
    if (unit === 'lb') {
      return `${Number((kg * 2.20462262).toFixed(1))} lb`;
    }
    return `${Number(kg.toFixed(1))} kg`;
  };

  const handleConfirm = () => {
    if (generated.items.length === 0) return;
    onApply({
      exercises: generated.items.map((i) => i.config),
      suggestedName: generated.suggestedName,
      suggestedDescription: generated.suggestedDescription,
      replaceExisting,
    });
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Entrenamiento Recomendado</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleConfirm} strong disabled={generated.items.length === 0}>
              <IonIcon slot="start" icon={checkmarkOutline} />
              Usar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Step 1: Muscle Groups */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#93c5fd',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '8px',
            }}
          >
            1. ¿Qué partes quieres entrenar hoy?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SELECTABLE_MUSCLES.map((muscle) => {
              const active = selectedMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 13px',
                    borderRadius: '12px',
                    border: active
                      ? '1.5px solid #3b82f6'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    background: active
                      ? 'rgba(59, 130, 246, 0.22)'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {active && <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1rem' }} />}
                  <span>{MUSCLE_GROUP_LABELS[muscle]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Exercise Count & Equipment */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              2. Cantidad de ejercicios
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[3, 4, 5, 6, 8].map((count) => {
                const active = totalExercises === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTotalExercises(count)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: active
                        ? '1.5px solid #3b82f6'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: active ? '#ffffff' : '#94a3b8',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              3. Equipo disponible (puedes elegir varios)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EQUIPMENT_OPTIONS.map((opt) => {
                const active =
                  opt.value === 'todos'
                    ? selectedEquipments.length === 0
                    : selectedEquipments.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleEquipment(opt.value)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 11px',
                      borderRadius: '9px',
                      border: active
                        ? '1.5px solid #10b981'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active
                        ? 'rgba(16, 185, 129, 0.18)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: active ? '#6ee7b7' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    {active && opt.value !== 'todos' && (
                      <IonIcon icon={checkmarkCircle} style={{ color: '#34d399', fontSize: '0.9rem' }} />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Option when routine already has exercises */}
        {existingExerciseIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setReplaceExisting(true)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '8px',
                border: 'none',
                background: replaceExisting ? '#2563eb' : 'transparent',
                color: replaceExisting ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Reemplazar lista actual
            </button>
            <button
              type="button"
              onClick={() => setReplaceExisting(false)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '8px',
                border: 'none',
                background: !replaceExisting ? '#2563eb' : 'transparent',
                color: !replaceExisting ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Agregar a los existentes
            </button>
          </div>
        )}

        {/* Preview Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonIcon icon={sparklesOutline} style={{ color: '#60a5fa', fontSize: '1.1rem' }} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
              Vista Previa ({generated.items.length})
            </span>
          </div>

          <IonButton
            size="small"
            fill="outline"
            color="medium"
            onClick={() => setSeedBump((s) => s + 1)}
            style={{ margin: 0, fontWeight: 700 }}
          >
            <IonIcon slot="start" icon={refreshOutline} />
            Variar
          </IonButton>
        </div>

        {/* Preview List */}
        {generated.items.length === 0 ? (
          <IonCard style={{ margin: '0 0 16px', borderRadius: '14px', textAlign: 'center', padding: '18px' }}>
            <IonIcon icon={barbellOutline} style={{ fontSize: '36px', color: 'var(--ion-color-medium)' }} />
            <p style={{ margin: '8px 0 0', color: 'var(--ion-color-medium)', fontSize: '0.86rem' }}>
              No hay ejercicios disponibles con esa combinación de filtros. Prueba eligiendo "Todo" en equipo.
            </p>
          </IonCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {generated.items.map((item, idx) => {
              const { config, source, muscleGroup } = item;
              const setsCount = config.targetSets;
              const repsText =
                config.mode === 'duration'
                  ? `${config.targetDurationSeconds || 45}s`
                  : `${config.targetReps || 10} reps`;
              const weightText =
                config.mode === 'weight_reps' && config.targetWeightKg
                  ? ` • ${formatWeight(config.targetWeightKg)}`
                  : '';

              return (
                <IonCard
                  key={`${config.exerciseId}-${idx}`}
                  style={{
                    margin: 0,
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <IonCardContent style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <ExerciseGif
                          gifUrl={config.gifUrl}
                          exerciseName={config.exerciseName}
                          muscleGroup={MUSCLE_GROUP_LABELS[muscleGroup]}
                          size="small"
                          allowZoom={true}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#ffffff', marginBottom: '4px' }}>
                            {idx + 1}. {config.exerciseName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                            {setsCount} series × {repsText}
                            <strong style={{ color: '#60a5fa' }}>{weightText}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <IonBadge color="primary" style={{ textTransform: 'capitalize', fontSize: '0.68rem' }}>
                          {MUSCLE_GROUP_LABELS[muscleGroup]}
                        </IonBadge>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color:
                              source === 'history'
                                ? '#34d399'
                                : source === 'routine'
                                  ? '#fbbf24'
                                  : '#94a3b8',
                          }}
                        >
                          {source === 'history'
                            ? 'Según tu último entreno'
                            : source === 'routine'
                              ? 'Según tus rutinas'
                              : 'Peso inicial sugerido'}
                        </span>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </div>
        )}

        {/* Primary Apply CTA */}
        <IonButton
          expand="block"
          color="primary"
          size="large"
          disabled={generated.items.length === 0}
          onClick={handleConfirm}
          style={{ fontWeight: 800, borderRadius: '14px', marginBottom: '12px' }}
        >
          <IonIcon slot="start" icon={sparklesOutline} />
          Colocar en la Rutina ({generated.items.length} ejercicios)
        </IonButton>
      </IonContent>
    </IonModal>
  );
};
