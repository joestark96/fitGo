import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonNote,
  IonText,
} from '@ionic/react';
import {
  closeOutline,
  saveOutline,
  addCircleOutline,
  trashOutline,
  barbellOutline,
  timerOutline,
  repeatOutline,
  searchOutline,
  swapHorizontalOutline,
  sparklesOutline,
  reorderTwoOutline,
  chevronDownOutline,
  chevronUpOutline,
  swapVerticalOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import {
  Routine,
  RoutineExerciseConfig,
  ExerciseMeasurementMode,
  ExerciseDefinition,
} from '../types';
import { ExerciseCatalogModal } from './ExerciseCatalogModal';
import { ExerciseGif } from './ExerciseGif';
import { WeightConverterModal } from './WeightConverterModal';

interface RoutineFormModalProps {
  isOpen: boolean;
  routineToEdit?: Routine | null;
  onClose: () => void;
  onSaved: (routine: Routine) => void;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({
  isOpen,
  routineToEdit,
  onClose,
  onSaved,
}) => {
  const { exercises, saveRoutine } = useApp();

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseConfig[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // New exercise state to add to routine
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showConverterModal, setShowConverterModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedExerciseDef, setSelectedExerciseDef] = useState<ExerciseDefinition | null>(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [mode, setMode] = useState<ExerciseMeasurementMode>('weight_reps');
  const [targetSets, setTargetSets] = useState<string>('3');
  const [targetReps, setTargetReps] = useState<string>('10');
  const [targetWeightKg, setTargetWeightKg] = useState<string>('20');
  const [addWeightUnit, setAddWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [cardWeightUnits, setCardWeightUnits] = useState<Record<string, 'kg' | 'lb'>>({});
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<string>('45');
  const [restSeconds, setRestSeconds] = useState<string>('60');

  const getCardUnit = (id: string): 'kg' | 'lb' => cardWeightUnits[id] || 'kg';
  const toggleCardUnit = (id: string) => {
    setCardWeightUnits((prev) => ({
      ...prev,
      [id]: prev[id] === 'lb' ? 'kg' : 'lb',
    }));
  };

  useEffect(() => {
    if (routineToEdit) {
      setRoutineName(routineToEdit.name);
      setDescription(routineToEdit.description || '');
      setRoutineExercises(routineToEdit.exercises || []);
    } else {
      setRoutineName('');
      setDescription('');
      setRoutineExercises([]);
    }
    setErrorMessage('');
    setShowAddExerciseForm(false);
    setShowCatalogModal(false);
    setSelectedExerciseDef(null);
    setIsReordering(false);
    setExpandedIds({});
    setDraggedIdx(null);
    setDragOverIdx(null);
  }, [routineToEdit, isOpen]);

  // Accordion and Reorder state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const collapseAll = () => {
    setExpandedIds({});
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    routineExercises.forEach((e) => {
      all[e.id] = true;
    });
    setExpandedIds(all);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleReorder = () => {
    if (!isReordering) {
      // Auto-collapse all accordions when reordering is activated
      collapseAll();
    }
    setIsReordering(!isReordering);
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= routineExercises.length || fromIndex === toIndex) return;
    const updated = [...routineExercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setRoutineExercises(updated);
  };

  const handleDragStart = (idx: number, e: React.DragEvent) => {
    // When drag and drop starts, immediately collapse all accordions
    collapseAll();
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      handleMoveExercise(draggedIdx, idx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const updateRoutineExercise = (id: string, updates: Partial<RoutineExerciseConfig>) => {
    setRoutineExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSelectCatalogExercise = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    if (exerciseId === 'CUSTOM') {
      setSelectedExerciseDef(null);
      setCustomExerciseName('');
      return;
    }
    const def = exercises.find((e) => e.id === exerciseId);
    if (def) {
      setSelectedExerciseDef(def);
      setCustomExerciseName(def.name);
      setMode(def.defaultMode);
    }
  };

  const handleExerciseSelectedFromCatalog = (exercise: ExerciseDefinition) => {
    setSelectedExerciseId(exercise.id);
    setSelectedExerciseDef(exercise);
    setCustomExerciseName(exercise.name);
    setMode(exercise.defaultMode);
    setShowAddExerciseForm(true);
    setErrorMessage('');
  };

  const handleSelectCustomExercise = () => {
    setSelectedExerciseId('CUSTOM');
    setSelectedExerciseDef(null);
    setCustomExerciseName('');
    setShowAddExerciseForm(true);
    setErrorMessage('');
  };

  const handleAddExerciseToRoutine = () => {
    const finalName =
      selectedExerciseId === 'CUSTOM'
        ? customExerciseName.trim()
        : exercises.find((e) => e.id === selectedExerciseId)?.name || customExerciseName.trim();

    if (!finalName) {
      setErrorMessage('Selecciona o ingresa el nombre de un ejercicio.');
      return;
    }

    const setsNum = parseInt(targetSets, 10) || 3;
    const repsNum = parseInt(targetReps, 10) || 10;
    const weightNum = parseFloat(targetWeightKg) || 0;
    const durationNum = parseInt(targetDurationSeconds, 10) || 45;
    const restNum = parseInt(restSeconds, 10) || 60;

    const newExerciseConfig: RoutineExerciseConfig = {
      id: 'cfg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      exerciseId: selectedExerciseId || 'custom-' + Date.now(),
      exerciseName: finalName,
      mode,
      targetSets: setsNum,
      targetReps: mode !== 'duration' ? repsNum : undefined,
      targetWeightKg: mode === 'weight_reps' ? weightNum : undefined,
      targetDurationSeconds: mode === 'duration' ? durationNum : undefined,
      restSeconds: restNum,
      gifUrl: selectedExerciseDef?.gifUrl || customGifUrl.trim() || undefined,
    };

    setRoutineExercises([...routineExercises, newExerciseConfig]);
    // Reset add form
    setShowAddExerciseForm(false);
    setSelectedExerciseId('');
    setSelectedExerciseDef(null);
    setCustomExerciseName('');
    setCustomGifUrl('');
    setErrorMessage('');
  };

  const handleRemoveExercise = (configId: string) => {
    setRoutineExercises(routineExercises.filter((e) => e.id !== configId));
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      setErrorMessage('Por favor asigna un nombre a la rutina.');
      return;
    }
    if (routineExercises.length === 0) {
      setErrorMessage('Agrega al menos un ejercicio a la rutina.');
      return;
    }

    const saved: Routine = {
      id: routineToEdit ? routineToEdit.id : 'routine-' + Date.now(),
      name: routineName.trim(),
      description: description.trim(),
      exercises: routineExercises,
      createdAt: routineToEdit ? routineToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRoutine(saved);
    onSaved(saved);
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
          <IonTitle>{routineToEdit ? 'Editar Rutina' : 'Nueva Rutina'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSaveRoutine} strong>
              <IonIcon slot="start" icon={saveOutline} />
              Guardar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {errorMessage && (
          <IonCard color="danger" style={{ marginBottom: '16px' }}>
            <IonCardContent style={{ padding: '10px 14px' }}>
              <strong>Error:</strong> {errorMessage}
            </IonCardContent>
          </IonCard>
        )}

        {/* Basic Routine Info */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '14px' }}>
          <IonCardHeader style={{ padding: '14px 16px 8px' }}>
            <IonCardTitle style={{ fontSize: '1.1rem' }}>Detalles de la Rutina</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0 16px 14px' }}>
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Nombre de la rutina *
              </IonLabel>
              <IonInput
                value={routineName}
                placeholder="Ej. Pecho & Bíceps Explosivo"
                onIonInput={(e) => setRoutineName(e.detail.value || '')}
              />
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Descripción o Enfoque (opcional)
              </IonLabel>
              <IonInput
                value={description}
                placeholder="Ej. 4 series pesadas por grupo muscular"
                onIonInput={(e) => setDescription(e.detail.value || '')}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Exercises List Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
              Ejercicios ({routineExercises.length})
            </h3>
            {routineExercises.length > 1 && (
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
            {routineExercises.length > 0 && !isReordering && (
              <IonButton
                size="small"
                fill="clear"
                color="medium"
                onClick={() => {
                  const anyOpen = Object.values(expandedIds).some(Boolean);
                  if (anyOpen) collapseAll();
                  else expandAll();
                }}
                style={{ margin: 0, height: '30px' }}
                title={Object.values(expandedIds).some(Boolean) ? 'Colapsar todos' : 'Expandir todos'}
              >
                <IonIcon slot="icon-only" icon={Object.values(expandedIds).some(Boolean) ? chevronUpOutline : chevronDownOutline} />
              </IonButton>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonButton
              size="small"
              fill="outline"
              color="medium"
              onClick={() => setShowConverterModal(true)}
              style={{ margin: 0, fontWeight: 700 }}
              title="Convertidor de Libras a Kilos"
            >
              <IonIcon slot="start" icon={swapHorizontalOutline} />
              Lb ⇄ Kg
            </IonButton>

            {!showAddExerciseForm && (
              <IonButton
                size="small"
                fill="outline"
                onClick={() => setShowCatalogModal(true)}
                style={{ margin: 0 }}
              >
                <IonIcon slot="start" icon={searchOutline} />
                Buscar en Catálogo
              </IonButton>
            )}
          </div>
        </div>

        {routineExercises.length === 0 && !showAddExerciseForm && (
          <IonCard style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '12px' }}>
            <IonIcon icon={barbellOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
            <p style={{ margin: '8px 0 14px', color: 'var(--ion-color-medium)' }}>
              Aún no has agregado ejercicios a esta rutina.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <IonButton
                fill="solid"
                onClick={() => setShowCatalogModal(true)}
              >
                <IonIcon slot="start" icon={searchOutline} />
                Explorar Catálogo
              </IonButton>
              <IonButton
                fill="outline"
                onClick={handleSelectCustomExercise}
              >
                <IonIcon slot="start" icon={addCircleOutline} />
                Personalizado
              </IonButton>
            </div>
          </IonCard>
        )}

        {/* List of current exercises (Accordion + Drag and Drop) */}
        {routineExercises.map((item, idx) => {
          const isCardExpanded = !!expandedIds[item.id] && !isReordering;
          const isDraggingThis = draggedIdx === idx;
          const isOverThis = dragOverIdx === idx;

          return (
            <IonCard
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDrop={(e) => handleDrop(idx, e)}
              onDragEnd={handleDragEnd}
              className={`${isDraggingThis ? 'dragging-card' : ''} ${isOverThis ? 'drag-over-card' : ''}`}
              style={{
                margin: '0 0 10px',
                borderRadius: '14px',
                border: isReordering ? '1px dashed var(--ion-color-step-200, #3f3f46)' : undefined,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Accordion Header */}
              <div
                className="accordion-header"
                onClick={() => {
                  if (!isReordering) toggleExpanded(item.id);
                }}
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isCardExpanded ? 'var(--ion-color-step-50, rgba(255,255,255,0.02))' : undefined,
                }}
              >
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
                  #{idx + 1}
                </span>

                <ExerciseGif
                  gifUrl={item.gifUrl}
                  exerciseName={item.exerciseName}
                  size="small"
                  allowZoom={true}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      fontSize: '0.98rem',
                      color: 'var(--ion-text-color)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.exerciseName}
                  </strong>

                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '3px' }}>
                    <IonBadge color="primary">{item.targetSets} Series</IonBadge>
                    {item.mode === 'weight_reps' && (
                      <>
                        <IonBadge color="secondary">{item.targetWeightKg ?? 0} kg</IonBadge>
                        <IonBadge color="tertiary">{item.targetReps ?? 10} reps</IonBadge>
                      </>
                    )}
                    {item.mode === 'reps_only' && (
                      <IonBadge color="tertiary">{item.targetReps ?? 12} reps</IonBadge>
                    )}
                    {item.mode === 'duration' && (
                      <IonBadge color="warning">{item.targetDurationSeconds ?? 45}s</IonBadge>
                    )}
                  </div>
                </div>

                {/* Up / Down Controls in Reorder mode */}
                {isReordering && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="medium"
                      disabled={idx === 0}
                      style={{ margin: 0, height: '28px', width: '28px' }}
                      onClick={() => handleMoveExercise(idx, idx - 1)}
                      title="Subir"
                    >
                      <IonIcon slot="icon-only" icon={chevronUpOutline} style={{ fontSize: '18px' }} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="medium"
                      disabled={idx === routineExercises.length - 1}
                      style={{ margin: 0, height: '28px', width: '28px' }}
                      onClick={() => handleMoveExercise(idx, idx + 1)}
                      title="Bajar"
                    >
                      <IonIcon slot="icon-only" icon={chevronDownOutline} style={{ fontSize: '18px' }} />
                    </IonButton>
                  </div>
                )}

                {/* Accordion Chevron toggle */}
                {!isReordering && (
                  <IonIcon
                    icon={chevronDownOutline}
                    className={`accordion-chevron ${isCardExpanded ? 'is-open' : ''}`}
                    style={{ fontSize: '18px', color: 'var(--ion-color-medium)' }}
                  />
                )}

                {/* Remove Button */}
                <IonButton
                  fill="clear"
                  color="danger"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveExercise(item.id);
                  }}
                  style={{ margin: 0, height: '32px', width: '32px' }}
                  title="Quitar ejercicio"
                >
                  <IonIcon slot="icon-only" icon={trashOutline} style={{ fontSize: '16px' }} />
                </IonButton>
              </div>

              {/* Accordion Body - In-place configuration */}
              {isCardExpanded && (
                <IonCardContent
                  style={{
                    padding: '10px 14px 14px',
                    borderTop: '1px solid var(--ion-color-step-100, #27272a)',
                    background: 'var(--ion-color-step-50, rgba(255,255,255,0.01))',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                    <div>
                      <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                        Series
                      </IonLabel>
                      <IonInput
                        type="number"
                        value={item.targetSets}
                        style={{
                          background: 'var(--ion-background-color, #121215)',
                          borderRadius: '8px',
                          border: '1px solid var(--ion-color-step-150, #27272a)',
                          textAlign: 'center',
                          fontWeight: 700,
                        }}
                        onIonInput={(e) => updateRoutineExercise(item.id, { targetSets: parseInt(e.detail.value || '1', 10) || 1 })}
                      />
                    </div>

                    {item.mode === 'weight_reps' && (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)' }}>
                              Peso ({getCardUnit(item.id).toUpperCase()})
                            </IonLabel>
                            <button
                              type="button"
                              onClick={() => toggleCardUnit(item.id)}
                              style={{
                                background: getCardUnit(item.id) === 'lb' ? 'var(--ion-color-primary)' : 'var(--ion-color-step-100, #27272a)',
                                color: getCardUnit(item.id) === 'lb' ? '#ffffff' : 'var(--ion-color-primary)',
                                border: '1px solid var(--ion-color-step-150, #3f3f46)',
                                borderRadius: '6px',
                                padding: '1px 5px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Alternar entre KG y LB"
                            >
                              <span>{getCardUnit(item.id).toUpperCase()}</span>
                              <IonIcon icon={swapHorizontalOutline} style={{ fontSize: '10px' }} />
                            </button>
                          </div>
                          <IonInput
                            type="number"
                            step={getCardUnit(item.id) === 'lb' ? '1' : '0.5'}
                            value={
                              getCardUnit(item.id) === 'lb'
                                ? Number(((item.targetWeightKg ?? 20) * 2.20462262).toFixed(1))
                                : (item.targetWeightKg ?? 20)
                            }
                            style={{
                              background: 'var(--ion-background-color, #121215)',
                              borderRadius: '8px',
                              border: '1px solid var(--ion-color-step-150, #27272a)',
                              textAlign: 'center',
                              fontWeight: 700,
                            }}
                            onIonInput={(e) => {
                              const val = parseFloat(e.detail.value || '0') || 0;
                              const kg = getCardUnit(item.id) === 'lb' ? Number((val * 0.45359237).toFixed(1)) : val;
                              updateRoutineExercise(item.id, { targetWeightKg: kg });
                            }}
                          />
                          <div style={{ fontSize: '0.66rem', color: getCardUnit(item.id) === 'lb' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)', fontWeight: 700, textAlign: 'center', marginTop: '2px' }}>
                            {getCardUnit(item.id) === 'lb'
                              ? `≈ ${item.targetWeightKg ?? 0} kg`
                              : `≈ ${(((item.targetWeightKg ?? 0) * 2.20462)).toFixed(1)} lb`}
                          </div>
                        </div>

                        <div>
                          <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                            Reps Objetivo
                          </IonLabel>
                          <IonInput
                            type="number"
                            value={item.targetReps ?? 10}
                            style={{
                              background: 'var(--ion-background-color, #121215)',
                              borderRadius: '8px',
                              border: '1px solid var(--ion-color-step-150, #27272a)',
                              textAlign: 'center',
                              fontWeight: 700,
                            }}
                            onIonInput={(e) => updateRoutineExercise(item.id, { targetReps: parseInt(e.detail.value || '1', 10) || 1 })}
                          />
                        </div>
                      </>
                    )}

                    {item.mode === 'reps_only' && (
                      <div>
                        <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                          Reps Objetivo
                        </IonLabel>
                        <IonInput
                          type="number"
                          value={item.targetReps ?? 12}
                          style={{
                            background: 'var(--ion-background-color, #121215)',
                            borderRadius: '8px',
                            border: '1px solid var(--ion-color-step-150, #27272a)',
                            textAlign: 'center',
                            fontWeight: 700,
                          }}
                          onIonInput={(e) => updateRoutineExercise(item.id, { targetReps: parseInt(e.detail.value || '1', 10) || 1 })}
                        />
                      </div>
                    )}

                    {item.mode === 'duration' && (
                      <div>
                        <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                          Segundos
                        </IonLabel>
                        <IonInput
                          type="number"
                          value={item.targetDurationSeconds ?? 45}
                          style={{
                            background: 'var(--ion-background-color, #121215)',
                            borderRadius: '8px',
                            border: '1px solid var(--ion-color-step-150, #27272a)',
                            textAlign: 'center',
                            fontWeight: 700,
                          }}
                          onIonInput={(e) => updateRoutineExercise(item.id, { targetDurationSeconds: parseInt(e.detail.value || '10', 10) || 10 })}
                        />
                      </div>
                    )}

                    <div>
                      <IonLabel style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                        Descanso (seg)
                      </IonLabel>
                      <IonInput
                        type="number"
                        value={item.restSeconds ?? 60}
                        style={{
                          background: 'var(--ion-background-color, #121215)',
                          borderRadius: '8px',
                          border: '1px solid var(--ion-color-step-150, #27272a)',
                          textAlign: 'center',
                          fontWeight: 700,
                        }}
                        onIonInput={(e) => updateRoutineExercise(item.id, { restSeconds: parseInt(e.detail.value || '30', 10) || 30 })}
                      />
                    </div>
                  </div>
                </IonCardContent>
              )}
            </IonCard>
          );
        })}

        {/* Add Exercise Sub-Form */}
        {showAddExerciseForm && (
          <IonCard
            style={{
              margin: '12px 0 20px',
              border: '2px solid var(--ion-color-primary)',
              borderRadius: '16px',
            }}
          >
            <IonCardHeader style={{ padding: '14px 16px 8px' }}>
              <IonCardTitle style={{ fontSize: '1.1rem', color: 'var(--ion-color-primary)' }}>
                Configurar Ejercicio
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent style={{ padding: '0 16px 16px' }}>
              {/* Exercise Selector / Preview Card */}
              {selectedExerciseDef ? (
                <div
                  style={{
                    background: 'var(--ion-card-background, var(--ion-color-step-50, #f8fafc))',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1.5px solid var(--ion-color-primary)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Top Bar with Badge & Cambiar Button */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <IonBadge
                        color="primary"
                        style={{
                          textTransform: 'capitalize',
                          fontSize: '0.8rem',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                        }}
                      >
                        {selectedExerciseDef.muscleGroup}
                      </IonBadge>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--ion-color-medium)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        Seleccionado
                      </span>
                    </div>

                    <IonButton
                      fill="outline"
                      size="small"
                      color="primary"
                      onClick={() => setShowCatalogModal(true)}
                      style={{ borderRadius: '8px', fontWeight: 600, margin: 0, height: '32px' }}
                    >
                      <IonIcon slot="start" icon={swapHorizontalOutline} />
                      Cambiar
                    </IonButton>
                  </div>

                  {/* Exercise Title full-width */}
                  <h3
                    style={{
                      margin: '0 0 12px',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--ion-text-color, #0f172a)',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedExerciseDef.name}
                  </h3>

                  {/* Animated GIF demonstration centered with breathing room */}
                  {selectedExerciseDef.gifUrl && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <ExerciseGif
                        gifUrl={selectedExerciseDef.gifUrl}
                        exerciseName={selectedExerciseDef.name}
                        muscleGroup={selectedExerciseDef.muscleGroup}
                        size="medium"
                        allowZoom={true}
                      />
                    </div>
                  )}

                  {selectedExerciseDef.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--ion-color-medium)',
                        lineHeight: 1.4,
                        textAlign: selectedExerciseDef.gifUrl ? 'center' : 'left',
                      }}
                    >
                      {selectedExerciseDef.description}
                    </p>
                  )}
                </div>
              ) : selectedExerciseId === 'CUSTOM' ? (
                <div style={{ marginBottom: '16px' }}>
                  <IonItem lines="full">
                    <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                      Nombre del ejercicio personalizado *
                    </IonLabel>
                    <IonInput
                      placeholder="Ej. Sentadilla Búlgara con Mancuernas"
                      value={customExerciseName}
                      onIonInput={(e) => setCustomExerciseName(e.detail.value || '')}
                    />
                  </IonItem>

                  <IonItem lines="full">
                    <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                      URL del GIF o animación (opcional)
                    </IonLabel>
                    <IonInput
                      type="url"
                      placeholder="https://ejemplo.com/ejercicio.gif"
                      value={customGifUrl}
                      onIonInput={(e) => setCustomGifUrl(e.detail.value || '')}
                    />
                  </IonItem>

                  {customGifUrl && (
                    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ExerciseGif
                        gifUrl={customGifUrl}
                        exerciseName={customExerciseName || 'Vista previa'}
                        size="small"
                      />
                      <IonText color="medium">
                        <small>Vista previa de la animación del ejercicio</small>
                      </IonText>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="primary"
                      onClick={() => setShowCatalogModal(true)}
                    >
                      <IonIcon slot="start" icon={searchOutline} />
                      Elegir del catálogo en su lugar
                    </IonButton>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <IonButton
                    expand="block"
                    fill="solid"
                    color="primary"
                    style={{ fontWeight: 600, borderRadius: '10px' }}
                    onClick={() => setShowCatalogModal(true)}
                  >
                    <IonIcon slot="start" icon={searchOutline} />
                    Buscar en el Catálogo de Ejercicios
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="medium"
                    size="small"
                    onClick={handleSelectCustomExercise}
                  >
                    <IonIcon slot="start" icon={sparklesOutline} />
                    Crear ejercicio personalizado
                  </IonButton>
                </div>
              )}

              {/* Requirement 1: Mode selector: Peso con reps, Duración, Solo Reps */}
              <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                <IonLabel style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
                  Tipo de medición:
                </IonLabel>
                <IonSegment
                  value={mode}
                  onIonChange={(e) => setMode(e.detail.value as ExerciseMeasurementMode)}
                >
                  <IonSegmentButton value="weight_reps">
                    <IonIcon icon={barbellOutline} />
                    <IonLabel>Peso + Reps</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="reps_only">
                    <IonIcon icon={repeatOutline} />
                    <IonLabel>Solo Reps</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="duration">
                    <IonIcon icon={timerOutline} />
                    <IonLabel>Duración</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>

              {/* Dynamic Inputs according to Mode with comfortable card layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  style={{
                    background: 'var(--ion-color-step-50, #f8fafc)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                    Nº DE SERIES
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonInput
                      type="number"
                      value={targetSets}
                      min="1"
                      max="20"
                      style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                      onIonInput={(e) => setTargetSets(e.detail.value || '3')}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>series</span>
                  </div>
                </div>

                {mode === 'weight_reps' && (
                  <>
                    <div
                      style={{
                        background: 'var(--ion-color-step-50, #f8fafc)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-primary)' }}>
                          PESO OBJETIVO
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddWeightUnit(addWeightUnit === 'kg' ? 'lb' : 'kg')}
                          style={{
                            background: addWeightUnit === 'lb' ? 'var(--ion-color-primary)' : 'var(--ion-color-step-100, #27272a)',
                            color: addWeightUnit === 'lb' ? '#ffffff' : 'var(--ion-color-primary)',
                            border: '1px solid var(--ion-color-step-150, #3f3f46)',
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                          title="Alternar entre KG y LB"
                        >
                          <span>{addWeightUnit.toUpperCase()}</span>
                          <IonIcon icon={swapHorizontalOutline} style={{ fontSize: '11px' }} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonInput
                          type="number"
                          step={addWeightUnit === 'lb' ? '1' : '0.5'}
                          value={
                            addWeightUnit === 'lb'
                              ? Number(((parseFloat(targetWeightKg) || 0) * 2.20462262).toFixed(1))
                              : targetWeightKg
                          }
                          placeholder={addWeightUnit === 'lb' ? '45' : '20'}
                          style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                          onIonInput={(e) => {
                            const val = parseFloat(e.detail.value || '0');
                            const kg = addWeightUnit === 'lb' ? Number((val * 0.45359237).toFixed(1)) : val;
                            setTargetWeightKg(isNaN(kg) ? '' : kg.toString());
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>{addWeightUnit}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: addWeightUnit === 'lb' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)', fontWeight: 600, marginTop: '2px' }}>
                        {addWeightUnit === 'lb'
                          ? `≈ ${targetWeightKg || 0} kg`
                          : `≈ ${((parseFloat(targetWeightKg) || 0) * 2.20462).toFixed(1)} lb`}
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'var(--ion-color-step-50, #f8fafc)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                      }}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-tertiary)', display: 'block', marginBottom: '4px' }}>
                        REPETICIONES
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonInput
                          type="number"
                          value={targetReps}
                          placeholder="10"
                          style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                          onIonInput={(e) => setTargetReps(e.detail.value || '')}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>reps</span>
                      </div>
                    </div>
                  </>
                )}

                {mode === 'reps_only' && (
                  <div
                    style={{
                      background: 'var(--ion-color-step-50, #f8fafc)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-tertiary)', display: 'block', marginBottom: '4px' }}>
                      REPETICIONES
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonInput
                        type="number"
                        value={targetReps}
                        placeholder="15"
                        style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                        onIonInput={(e) => setTargetReps(e.detail.value || '')}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>reps</span>
                    </div>
                  </div>
                )}

                {mode === 'duration' && (
                  <div
                    style={{
                      background: 'var(--ion-color-step-50, #f8fafc)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-warning)', display: 'block', marginBottom: '4px' }}>
                      DURACIÓN
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonInput
                        type="number"
                        value={targetDurationSeconds}
                        placeholder="45"
                        style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                        onIonInput={(e) => setTargetDurationSeconds(e.detail.value || '')}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>seg</span>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: 'var(--ion-color-step-50, #f8fafc)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                    DESCANSO
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonInput
                      type="number"
                      value={restSeconds}
                      placeholder="60"
                      style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0 }}
                      onIonInput={(e) => setRestSeconds(e.detail.value || '')}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>seg</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <IonButton
                  fill="outline"
                  color="medium"
                  style={{ flex: 1, borderRadius: '10px' }}
                  onClick={() => setShowAddExerciseForm(false)}
                >
                  Cancelar
                </IonButton>
                <IonButton
                  fill="solid"
                  color="primary"
                  style={{ flex: 2, borderRadius: '10px', fontWeight: 700 }}
                  onClick={handleAddExerciseToRoutine}
                >
                  <IonIcon slot="start" icon={addCircleOutline} />
                  Añadir a la lista
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        <div style={{ marginTop: '24px', paddingBottom: '20px' }}>
          <IonButton
            expand="block"
            size="large"
            style={{ fontWeight: 600, borderRadius: '12px' }}
            onClick={handleSaveRoutine}
          >
            <IonIcon slot="start" icon={saveOutline} />
            {routineToEdit ? 'Guardar Cambios' : 'Crear Rutina'}
          </IonButton>
        </div>

        {/* Modal de Catálogo de Ejercicios con Buscador y Filtro por Músculo */}
        <ExerciseCatalogModal
          isOpen={showCatalogModal}
          onClose={() => setShowCatalogModal(false)}
          onSelectExercise={handleExerciseSelectedFromCatalog}
          onSelectCustom={handleSelectCustomExercise}
        />

        {/* Lbs to Kg Converter Modal */}
        <WeightConverterModal
          isOpen={showConverterModal}
          onClose={() => setShowConverterModal(false)}
        />
      </IonContent>
    </IonModal>
  );
};

