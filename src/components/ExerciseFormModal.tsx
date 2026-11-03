import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/react';
import {
  closeOutline,
  saveOutline,
  barbellOutline,
  timerOutline,
  repeatOutline,
  imageOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { ExerciseDefinition, ExerciseMeasurementMode, MuscleGroup, EquipmentType } from '../types';

interface ExerciseFormModalProps {
  isOpen: boolean;
  exerciseToEdit?: ExerciseDefinition | null;
  onClose: () => void;
  onSaved: (savedExercise: ExerciseDefinition) => void;
}

const MUSCLE_OPTIONS: { key: MuscleGroup; label: string; emoji: string }[] = [
  { key: 'pecho', label: 'Pecho', emoji: '🏋️' },
  { key: 'espalda', label: 'Espalda', emoji: '🧗' },
  { key: 'piernas', label: 'Piernas', emoji: '🦵' },
  { key: 'hombros', label: 'Hombros', emoji: '🦾' },
  { key: 'brazos', label: 'Brazos', emoji: '💪' },
  { key: 'core', label: 'Core / Abdomen', emoji: '🧘' },
  { key: 'cardio', label: 'Cardio / Funcional', emoji: '🏃' },
  { key: 'cuerpo_completo', label: 'Cuerpo Completo', emoji: '🤸' },
];

const EQUIPMENT_OPTIONS: { key: EquipmentType; label: string; emoji: string }[] = [
  { key: 'sin_equipo', label: 'Sin Equipo (En Casa / Calistenia)', emoji: '🏠' },
  { key: 'mancuernas', label: 'Mancuernas', emoji: '🏋️' },
  { key: 'barra', label: 'Barra', emoji: '🥢' },
  { key: 'maquina', label: 'Máquina Guiada', emoji: '⚙️' },
  { key: 'polea', label: 'Polea / Cable', emoji: '🔗' },
  { key: 'bandas', label: 'Bandas Elásticas', emoji: '🎗️' },
  { key: 'otro', label: 'Otro Equipo', emoji: '📦' },
];

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  isOpen,
  exerciseToEdit,
  onClose,
  onSaved,
}) => {
  const { saveExercise } = useApp();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('pecho');
  const [equipment, setEquipment] = useState<EquipmentType>('sin_equipo');
  const [defaultMode, setDefaultMode] = useState<ExerciseMeasurementMode>('weight_reps');
  const [description, setDescription] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (exerciseToEdit) {
      setName(exerciseToEdit.name);
      setMuscleGroup(exerciseToEdit.muscleGroup);
      setEquipment(exerciseToEdit.equipment || 'sin_equipo');
      setDefaultMode(exerciseToEdit.defaultMode);
      setDescription(exerciseToEdit.description || '');
      setGifUrl(exerciseToEdit.gifUrl || '');
    } else {
      setName('');
      setMuscleGroup('pecho');
      setEquipment('sin_equipo');
      setDefaultMode('weight_reps');
      setDescription('');
      setGifUrl('');
    }
    setErrorMessage('');
  }, [exerciseToEdit, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa el nombre del ejercicio.');
      return;
    }

    const cleanGifUrl = gifUrl.trim();
    const finalExercise: ExerciseDefinition = {
      id: exerciseToEdit ? exerciseToEdit.id : 'custom-ex-' + Date.now(),
      name: name.trim(),
      muscleGroup,
      equipment,
      defaultMode,
      description: description.trim() || undefined,
      gifUrl: cleanGifUrl || undefined,
    };

    saveExercise(finalExercise);
    onSaved(finalExercise);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{exerciseToEdit ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {errorMessage && (
          <IonCard color="danger" style={{ margin: '0 0 16px' }}>
            <IonCardContent style={{ padding: '10px 14px' }}>{errorMessage}</IonCardContent>
          </IonCard>
        )}

        <IonCard style={{ margin: '0 0 16px', borderRadius: '16px' }}>
          <IonCardContent style={{ padding: '14px' }}>
            {/* Nombre del Ejercicio */}
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Nombre del ejercicio *
              </IonLabel>
              <IonInput
                value={name}
                placeholder="ej. Press Francés con Mancuerna"
                onIonInput={(e) => setName(e.detail.value || '')}
              />
            </IonItem>

            {/* Grupo Muscular Principal */}
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Músculo o grupo principal *
              </IonLabel>
              <IonSelect
                value={muscleGroup}
                interface="popover"
                onIonChange={(e) => setMuscleGroup(e.detail.value)}
              >
                {MUSCLE_OPTIONS.map((opt) => (
                  <IonSelectOption key={opt.key} value={opt.key}>
                    {opt.emoji} {opt.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {/* Equipamiento Requerido */}
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Equipamiento requerido *
              </IonLabel>
              <IonSelect
                value={equipment}
                interface="popover"
                onIonChange={(e) => setEquipment(e.detail.value)}
              >
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <IonSelectOption key={opt.key} value={opt.key}>
                    {opt.emoji} {opt.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {/* Modo de Medición */}
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Tipo de medición *
              </IonLabel>
              <IonSelect
                value={defaultMode}
                interface="popover"
                onIonChange={(e) => setDefaultMode(e.detail.value)}
              >
                <IonSelectOption value="weight_reps">
                  🏋️ Peso + Repeticiones (ej. 4 series x 10 reps @ 60kg)
                </IonSelectOption>
                <IonSelectOption value="reps_only">
                  🔢 Solo Repeticiones (ej. Flexiones, Dominadas)
                </IonSelectOption>
                <IonSelectOption value="duration">
                  ⏱️ Por Tiempo / Duración (ej. Plancha, Trote)
                </IonSelectOption>
              </IonSelect>
            </IonItem>

            {/* Descripción / Técnica */}
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Descripción o consejos de técnica (opcional)
              </IonLabel>
              <IonTextarea
                value={description}
                placeholder="ej. Mantener codos pegados, espalda recta y bajar de forma controlada."
                rows={2}
                onIonInput={(e) => setDescription(e.detail.value || '')}
              />
            </IonItem>

            {/* URL del GIF / Imagen */}
            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                URL de imagen o GIF animado (opcional)
              </IonLabel>
              <IonInput
                value={gifUrl}
                type="url"
                placeholder="https://ejemplo.com/ejercicio.gif"
                onIonInput={(e) => setGifUrl(e.detail.value || '')}
              />
            </IonItem>

            {/* Vista previa si ingresa una URL */}
            {gifUrl && (
              <div
                style={{
                  marginTop: '12px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  textAlign: 'center',
                  background: 'var(--ion-color-step-100, #1e293b)',
                  border: '1px solid var(--ion-color-step-150, #cbd5e1)',
                  padding: '8px',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--ion-color-medium)', marginBottom: '4px' }}>
                  Vista previa de imagen:
                </div>
                <img
                  src={gifUrl}
                  alt="Vista previa"
                  style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          style={{ fontWeight: 700, borderRadius: '12px' }}
          onClick={handleSave}
        >
          <IonIcon slot="start" icon={saveOutline} />
          {exerciseToEdit ? 'Guardar Cambios' : 'Crear y Añadir al Catálogo'}
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

