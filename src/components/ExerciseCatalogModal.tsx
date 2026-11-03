import React, { useState, useMemo } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonBadge,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
} from '@ionic/react';
import {
  closeOutline,
  checkmarkCircleOutline,
  barbellOutline,
  timerOutline,
  repeatOutline,
  addCircleOutline,
  filterOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { ExerciseDefinition, MuscleGroup, EquipmentType } from '../types';
import { ExerciseGif } from './ExerciseGif';
import { ExerciseFormModal } from './ExerciseFormModal';

interface ExerciseCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
  onSelectCustom?: () => void;
}

const MUSCLE_FILTERS: { key: MuscleGroup | 'todos'; label: string; color: string }[] = [
  { key: 'todos', label: 'Todos los músculos', color: 'primary' },
  { key: 'pecho', label: 'Pecho', color: 'primary' },
  { key: 'espalda', label: 'Espalda', color: 'success' },
  { key: 'piernas', label: 'Piernas', color: 'tertiary' },
  { key: 'hombros', label: 'Hombros', color: 'warning' },
  { key: 'brazos', label: 'Brazos', color: 'danger' },
  { key: 'core', label: 'Core / Abdomen', color: 'secondary' },
  { key: 'cardio', label: 'Cardio', color: 'warning' },
];

export type EquipmentFilterKey = 'todos' | 'casa' | 'mancuernas' | 'maquina' | 'polea' | 'barra' | 'bandas';

const EQUIPMENT_FILTERS: { key: EquipmentFilterKey; label: string }[] = [
  { key: 'todos', label: 'Todo el equipo' },
  { key: 'casa', label: '🏠 En Casa / Sin Máquina' },
  { key: 'mancuernas', label: '🏋️ Mancuernas' },
  { key: 'maquina', label: '⚙️ Máquinas' },
  { key: 'polea', label: '🔗 Poleas' },
  { key: 'barra', label: '🥢 Barra' },
  { key: 'bandas', label: '🎗️ Bandas' },
];

export const getEquipmentBadge = (eq?: EquipmentType): { label: string; color: string } => {
  switch (eq) {
    case 'sin_equipo':
      return { label: '🏠 En Casa', color: 'success' };
    case 'bandas':
      return { label: '🎗️ Bandas', color: 'tertiary' };
    case 'mancuernas':
      return { label: '🏋️ Mancuerna', color: 'secondary' };
    case 'maquina':
      return { label: '⚙️ Máquina', color: 'warning' };
    case 'polea':
      return { label: '🔗 Polea', color: 'primary' };
    case 'barra':
      return { label: '🥢 Barra', color: 'danger' };
    default:
      return { label: 'En Casa / Libre', color: 'medium' };
  }
};

const STOP_WORDS = new Set(['de', 'y', 'la', 'el', 'en', 'con', 'un', 'una', 'para', 'del', 'al', 'los', 'las', 'es', 'que']);

export const ExerciseCatalogModal: React.FC<ExerciseCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  onSelectCustom,
}) => {
  const { exercises } = useApp();
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'todos'>('todos');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentFilterKey>('todos');
  const [previewExercise, setPreviewExercise] = useState<ExerciseDefinition | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseDefinition | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setExerciseToEdit(null);
    setIsCreateModalOpen(true);
  };

  // Filter exercises by search query, muscle group, and equipment with accent-insensitive & multi-word matching
  const filteredExercises = useMemo(() => {
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\bpeck\b/g, 'pec')
        .trim();

    const normalizedSearch = normalize(searchText);
    const rawWords = normalizedSearch.split(/\s+/).filter(Boolean);
    const meaningfulWords = rawWords.filter((w) => !STOP_WORDS.has(w) || rawWords.length === 1);
    const searchWords = meaningfulWords.length > 0 ? meaningfulWords : rawWords;

    return exercises.filter((ex) => {
      const normName = normalize(ex.name);
      const normDesc = normalize(ex.description || '');
      const normMuscle = normalize(ex.muscleGroup);
      const normEq = normalize(ex.equipment || '');
      const combined = `${normName} ${normDesc} ${normMuscle} ${normEq}`;

      // Check if this exercise covers rear delts / upper back (trained in both shoulders and back)
      const isRearDelt =
        normName.includes('deltoide') ||
        normDesc.includes('deltoide') ||
        normName.includes('pajaro') ||
        normDesc.includes('pajaro') ||
        ex.id.includes('pajaro') ||
        ex.id.includes('reverse-fly');

      const matchesMuscle =
        selectedMuscle === 'todos' ||
        ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase() ||
        (isRearDelt && ex.muscleGroup === 'hombros' && selectedMuscle === 'espalda');

      if (!matchesMuscle) return false;

      const matchesEquipment = (() => {
        if (selectedEquipment === 'todos') return true;
        if (selectedEquipment === 'casa') {
          return ex.equipment === 'sin_equipo' || ex.equipment === 'bandas';
        }
        return ex.equipment === selectedEquipment;
      })();

      if (!matchesEquipment) return false;

      if (searchWords.length === 0) return true;

      // All search words must be present in the exercise name, description, muscle group, or equipment (with stem matching for plurals)
      return searchWords.every((word) => {
        if (combined.includes(word)) return true;
        const stem =
          word.endsWith('es') && word.length > 4
            ? word.slice(0, -2)
            : word.endsWith('s') && word.length > 3
            ? word.slice(0, -1)
            : word;
        return combined.includes(stem);
      });
    });
  }, [exercises, selectedMuscle, selectedEquipment, searchText]);

  const getMuscleBadgeColor = (muscle: MuscleGroup): string => {
    switch (muscle) {
      case 'pecho':
        return 'primary';
      case 'espalda':
        return 'success';
      case 'piernas':
        return 'tertiary';
      case 'hombros':
        return 'warning';
      case 'brazos':
        return 'danger';
      case 'core':
        return 'secondary';
      case 'cardio':
        return 'warning';
      default:
        return 'medium';
    }
  };

  const getModeInfo = (mode: string) => {
    switch (mode) {
      case 'weight_reps':
        return { label: 'Peso + Reps', icon: barbellOutline, color: 'secondary' };
      case 'duration':
        return { label: 'Duración', icon: timerOutline, color: 'warning' };
      case 'reps_only':
        return { label: 'Solo Reps', icon: repeatOutline, color: 'tertiary' };
      default:
        return { label: mode, icon: barbellOutline, color: 'medium' };
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Catálogo de Ejercicios</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Search bar */}
        <div style={{ background: 'var(--ion-color-primary)', padding: '0 8px 8px' }}>
          <IonSearchbar
            value={searchText}
            placeholder="Buscar por nombre o descripción..."
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            debounce={100}
            style={
              {
                '--background': 'var(--ion-color-step-50, #ffffff)',
                '--color': 'var(--ion-text-color, #111827)',
                '--placeholder-color': 'var(--ion-color-medium, #6b7280)',
                '--icon-color': 'var(--ion-color-medium, #4b5563)',
                '--clear-button-color': 'var(--ion-color-medium, #4b5563)',
                borderRadius: '12px',
                padding: 0,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Horizontal scrollable muscle filter pills */}
        <div
          style={{
            background: 'var(--ion-card-background, var(--ion-background-color, #ffffff))',
            display: 'flex',
            overflowX: 'auto',
            padding: '8px 12px 6px',
            gap: '8px',
            scrollbarWidth: 'none',
          }}
        >
          {MUSCLE_FILTERS.map((item) => {
            const isSelected = selectedMuscle === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedMuscle(item.key)}
                style={{
                  background: isSelected
                    ? 'var(--ion-color-primary)'
                    : 'var(--ion-color-step-100, #f1f5f9)',
                  color: isSelected
                    ? '#ffffff'
                    : 'var(--ion-text-color, #0f172a)',
                  border: isSelected
                    ? '1px solid var(--ion-color-primary)'
                    : '1px solid var(--ion-color-step-200, rgba(255,255,255,0.12))',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal scrollable equipment filter pills */}
        <div
          style={{
            background: 'var(--ion-card-background, var(--ion-background-color, #ffffff))',
            display: 'flex',
            overflowX: 'auto',
            padding: '0 12px 10px',
            gap: '8px',
            borderBottom: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
            scrollbarWidth: 'none',
          }}
        >
          {EQUIPMENT_FILTERS.map((item) => {
            const isSelected = selectedEquipment === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedEquipment(item.key)}
                style={{
                  background: isSelected
                    ? 'var(--ion-color-secondary, #38bdf8)'
                    : 'var(--ion-color-step-100, #f1f5f9)',
                  color: isSelected
                    ? '#000000'
                    : 'var(--ion-text-color, #0f172a)',
                  border: isSelected
                    ? '1px solid var(--ion-color-secondary, #38bdf8)'
                    : '1px solid var(--ion-color-step-200, rgba(255,255,255,0.12))',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Results count header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ion-color-medium)' }}>
            Mostrando {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''}
          </span>

          <IonButton
            size="small"
            fill="clear"
            color="primary"
            onClick={handleOpenCreateModal}
          >
            <IonIcon slot="start" icon={addCircleOutline} />
            + Personalizado
          </IonButton>
        </div>

        {filteredExercises.length === 0 ? (
          <IonCard style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '14px' }}>
            <IonIcon
              icon={barbellOutline}
              style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }}
            />
            <h4 style={{ margin: '8px 0 4px', fontWeight: 700 }}>No se encontraron ejercicios</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--ion-color-medium)' }}>
              ¿No está el ejercicio que buscas? Puedes crearlo como ejercicio personalizado.
            </p>
            <IonButton
              fill="solid"
              color="primary"
              onClick={handleOpenCreateModal}
            >
              <IonIcon slot="start" icon={addCircleOutline} />
              Crear ejercicio personalizado
            </IonButton>
          </IonCard>
        ) : (
          filteredExercises.map((exercise) => {
            const modeInfo = getModeInfo(exercise.defaultMode);
            const muscleColor = getMuscleBadgeColor(exercise.muscleGroup);

            return (
              <IonCard
                key={exercise.id}
                style={{
                  margin: '0 0 10px',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  border: '1px solid var(--ion-color-step-100, #f0f0f0)',
                  transition: 'transform 0.1s ease, border-color 0.15s ease',
                }}
                onClick={() => setPreviewExercise(exercise)}
              >
                <IonCardContent style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Animated GIF Thumbnail - Clicking it opens preview */}
                    <ExerciseGif
                      gifUrl={exercise.gifUrl}
                      exerciseName={exercise.name}
                      muscleGroup={exercise.muscleGroup}
                      size="small"
                      allowZoom={false}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '1.02rem', color: 'var(--ion-text-color, #ffffff)', display: 'block' }}>
                        {exercise.name}
                      </strong>

                      {exercise.description && (
                        <p
                          style={{
                            margin: '3px 0 6px',
                            fontSize: '0.82rem',
                            color: 'var(--ion-color-medium)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {exercise.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <IonBadge
                          color={muscleColor}
                          style={{
                            textTransform: 'capitalize',
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                          }}
                        >
                          {exercise.muscleGroup}
                        </IonBadge>

                        {exercise.equipment && (
                          <IonBadge
                            color={getEquipmentBadge(exercise.equipment).color}
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                            }}
                          >
                            {getEquipmentBadge(exercise.equipment).label}
                          </IonBadge>
                        )}

                        <IonBadge
                          color={modeInfo.color}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontWeight: 700,
                          }}
                        >
                          <IonIcon icon={modeInfo.icon} />
                          {modeInfo.label}
                        </IonBadge>
                      </div>
                    </div>

                    <IonButton
                      fill="outline"
                      size="small"
                      color="primary"
                      style={{ margin: 0, borderRadius: '8px', fontWeight: 600, flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExercise(exercise);
                        onClose();
                      }}
                    >
                      <IonIcon slot="start" icon={checkmarkCircleOutline} />
                      Elegir
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            );
          })
        )}

        {/* Footer custom creation button */}
        <div style={{ margin: '18px 0 24px', textAlign: 'center' }}>
          <IonButton
            fill="clear"
            color="primary"
            style={{ fontWeight: 600 }}
            onClick={handleOpenCreateModal}
          >
            <IonIcon slot="start" icon={sparklesOutline} />
            ¿No encuentras tu ejercicio? Crear uno nuevo
          </IonButton>
        </div>

        {/* Modal CRUD para Crear / Editar Ejercicio */}
        <ExerciseFormModal
          isOpen={isCreateModalOpen}
          exerciseToEdit={exerciseToEdit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setExerciseToEdit(null);
          }}
          onSaved={(newEx) => {
            setIsCreateModalOpen(false);
            setExerciseToEdit(null);
            setToastMessage(`¡Ejercicio "${newEx.name}" añadido al catálogo! 🏋️`);
            // Si el catálogo fue abierto desde el constructor de rutinas, seleccionar automáticamente el nuevo ejercicio
            if (onSelectCustom) {
              onSelectExercise(newEx);
              onClose();
            }
          }}
        />

        {/* Toast de confirmación */}
        <IonToast
          isOpen={Boolean(toastMessage)}
          message={toastMessage || ''}
          duration={2200}
          onDidDismiss={() => setToastMessage(null)}
          position="bottom"
          color="dark"
        />

        {/* Modal de Detalle / Vista Previa del GIF (cerrar aquí NUNCA abre otra pantalla) */}
        <IonModal
          isOpen={Boolean(previewExercise)}
          onDidDismiss={() => setPreviewExercise(null)}
          style={{ '--height': 'auto', '--border-radius': '16px' }}
        >
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle style={{ fontSize: '1.05rem' }}>Detalle del Ejercicio</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setPreviewExercise(null)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          {previewExercise && (
            <IonContent className="ion-padding" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '8px 0 4px', fontWeight: 800 }}>{previewExercise.name}</h3>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                <IonBadge
                  color={getMuscleBadgeColor(previewExercise.muscleGroup)}
                  style={{ textTransform: 'capitalize', padding: '4px 8px' }}
                >
                  Músculo: {previewExercise.muscleGroup}
                </IonBadge>
                {previewExercise.equipment && (
                  <IonBadge
                    color={getEquipmentBadge(previewExercise.equipment).color}
                    style={{ padding: '4px 8px' }}
                  >
                    {getEquipmentBadge(previewExercise.equipment).label}
                  </IonBadge>
                )}
                <IonBadge
                  color={getModeInfo(previewExercise.defaultMode).color}
                  style={{ padding: '4px 8px' }}
                >
                  {getModeInfo(previewExercise.defaultMode).label}
                </IonBadge>
              </div>

              {previewExercise.gifUrl && (
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    background: 'var(--ion-color-step-100, #1e293b)',
                    border: '1px solid var(--ion-color-step-150, #e2e8f0)',
                    margin: '0 auto 16px',
                    maxWidth: '340px',
                  }}
                >
                  <img
                    src={previewExercise.gifUrl}
                    alt={previewExercise.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              )}

              {previewExercise.description && (
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--ion-color-medium)',
                    margin: '0 0 16px',
                    padding: '0 8px',
                  }}
                >
                  {previewExercise.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingBottom: '12px' }}>
                <IonButton
                  fill="outline"
                  color="medium"
                  style={{ flex: 1, borderRadius: '10px' }}
                  onClick={() => setPreviewExercise(null)}
                >
                  Cerrar
                </IonButton>
                <IonButton
                  fill="solid"
                  color="primary"
                  style={{ flex: 1.6, borderRadius: '10px', fontWeight: 700 }}
                  onClick={() => {
                    const toSelect = previewExercise;
                    setPreviewExercise(null);
                    onSelectExercise(toSelect);
                    onClose();
                  }}
                >
                  <IonIcon slot="start" icon={checkmarkCircleOutline} />
                  Elegir ejercicio
                </IonButton>
              </div>
            </IonContent>
          )}
        </IonModal>
      </IonContent>
    </IonModal>
  );
};
