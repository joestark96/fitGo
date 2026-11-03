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
  IonBadge,
} from '@ionic/react';
import {
  closeOutline,
  saveOutline,
  fastFoodOutline,
  flameOutline,
  sparklesOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { FoodEntry, MealType } from '../types';
import { DateInput } from './DateInput';

interface FoodEntryModalProps {
  isOpen: boolean;
  entryToEdit?: FoodEntry | null;
  defaultMealType?: MealType;
  selectedDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSaved: () => void;
}

const QUICK_FOOD_PRESETS: { name: string; calories: number; meal: MealType; protein: number; carbs: number; fat: number }[] = [
  // Desayuno
  { name: 'Huevos revueltos con tostadas', calories: 340, meal: 'desayuno', protein: 18, carbs: 26, fat: 16 },
  { name: 'Avena con leche y plátano', calories: 380, meal: 'desayuno', protein: 14, carbs: 65, fat: 7 },
  { name: 'Yogur griego con frutos rojos', calories: 210, meal: 'desayuno', protein: 17, carbs: 22, fat: 4 },
  { name: 'Café con leche y tostada con pavo', calories: 230, meal: 'desayuno', protein: 15, carbs: 24, fat: 6 },
  // Almuerzo
  { name: 'Pechuga de pollo con arroz y ensalada', calories: 520, meal: 'almuerzo', protein: 44, carbs: 58, fat: 10 },
  { name: 'Filete de ternera con patatas al horno', calories: 580, meal: 'almuerzo', protein: 48, carbs: 45, fat: 20 },
  { name: 'Salmón a la plancha con verduras', calories: 490, meal: 'almuerzo', protein: 38, carbs: 18, fat: 28 },
  { name: 'Pasta boloñesa magra', calories: 540, meal: 'almuerzo', protein: 32, carbs: 72, fat: 14 },
  // Cena
  { name: 'Ensalada completa con atún y huevo', calories: 360, meal: 'cena', protein: 30, carbs: 12, fat: 18 },
  { name: 'Tortilla francesa con queso y tomate', calories: 320, meal: 'cena', protein: 20, carbs: 6, fat: 22 },
  { name: 'Pechuga a la plancha con puré de calabaza', calories: 370, meal: 'cena', protein: 40, carbs: 32, fat: 6 },
  { name: 'Sopa de verduras con pollo desmenuzado', calories: 290, meal: 'cena', protein: 26, carbs: 24, fat: 7 },
  // Snacks
  { name: 'Batido de proteína de suero', calories: 150, meal: 'snack', protein: 25, carbs: 4, fat: 2 },
  { name: 'Manzana con crema de cacahuate', calories: 210, meal: 'snack', protein: 6, carbs: 28, fat: 10 },
  { name: 'Puñado de frutos secos (30g)', calories: 180, meal: 'snack', protein: 5, carbs: 6, fat: 16 },
  { name: 'Barra de proteína energética', calories: 200, meal: 'snack', protein: 15, carbs: 22, fat: 6 },
];

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  entryToEdit,
  defaultMealType = 'almuerzo',
  selectedDate,
  onClose,
  onSaved,
}) => {
  const { saveFoodEntry } = useApp();

  const [date, setDate] = useState(selectedDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (entryToEdit) {
      setDate(entryToEdit.date);
      setMealType(entryToEdit.mealType);
      setName(entryToEdit.name);
      setCalories(entryToEdit.calories.toString());
      setProtein(entryToEdit.proteinGrams ? entryToEdit.proteinGrams.toString() : '');
      setCarbs(entryToEdit.carbsGrams ? entryToEdit.carbsGrams.toString() : '');
      setFat(entryToEdit.fatGrams ? entryToEdit.fatGrams.toString() : '');
      setNotes(entryToEdit.notes || '');
    } else {
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setMealType(defaultMealType);
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setNotes('');
    }
    setErrorMessage('');
  }, [entryToEdit, defaultMealType, selectedDate, isOpen]);

  const handleApplyPreset = (preset: typeof QUICK_FOOD_PRESETS[0]) => {
    setName(preset.name);
    setCalories(preset.calories.toString());
    setProtein(preset.protein.toString());
    setCarbs(preset.carbs.toString());
    setFat(preset.fat.toString());
    setMealType(preset.meal);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Ingresa el nombre del alimento o comida.');
      return;
    }
    const parsedCalories = parseInt(calories, 10);
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      setErrorMessage('Ingresa una cantidad de calorías válida.');
      return;
    }

    const entry: FoodEntry = {
      id: entryToEdit ? entryToEdit.id : 'food-' + Date.now(),
      date,
      mealType,
      name: name.trim(),
      calories: parsedCalories,
      proteinGrams: protein ? parseFloat(protein) : undefined,
      carbsGrams: carbs ? parseFloat(carbs) : undefined,
      fatGrams: fat ? parseFloat(fat) : undefined,
      notes: notes.trim() || undefined,
      createdAt: entryToEdit ? entryToEdit.createdAt : new Date().toISOString(),
    };

    saveFoodEntry(entry);
    onSaved();
    onClose();
  };

  const mealPresets = QUICK_FOOD_PRESETS.filter((p) => p.meal === mealType);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{entryToEdit ? 'Editar Comida' : 'Registrar Comida'}</IonTitle>
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

        {/* Date & Meal Type Selection */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '16px' }}>
          <IonCardContent style={{ padding: '14px' }}>
            <DateInput
              label="Fecha de consumo"
              value={date}
              onChange={setDate}
              required
            />

            <IonItem lines="none" style={{ marginTop: '8px' }}>
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Momento de la comida *
              </IonLabel>
              <IonSelect
                value={mealType}
                interface="popover"
                onIonChange={(e) => setMealType(e.detail.value)}
              >
                <IonSelectOption value="desayuno">🌅 Desayuno</IonSelectOption>
                <IonSelectOption value="almuerzo">🍽️ Almuerzo</IonSelectOption>
                <IonSelectOption value="cena">🌙 Cena</IonSelectOption>
                <IonSelectOption value="snack">🥪 Snack / Merienda</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Quick Food Suggestions */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--ion-color-medium)',
              marginBottom: '8px',
            }}
          >
            <IonIcon icon={sparklesOutline} color="warning" />
            <span>Sugerencias rápidas para {mealType}:</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {mealPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  background: 'var(--ion-color-step-100, #f1f5f9)',
                  color: 'var(--ion-text-color, #0f172a)',
                  border: '1px solid var(--ion-color-step-200, rgba(255,255,255,0.12))',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{preset.name}</span>
                <span style={{ color: 'var(--ion-color-primary)', fontWeight: 800 }}>
                  {preset.calories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Food Details Form */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '16px' }}>
          <IonCardContent style={{ padding: '14px' }}>
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Alimento / Plato *
              </IonLabel>
              <IonInput
                value={name}
                placeholder="ej. Pechuga de pollo con arroz"
                onIonInput={(e) => setName(e.detail.value || '')}
              />
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Calorías (kcal) *
              </IonLabel>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IonInput
                  type="number"
                  value={calories}
                  placeholder="ej. 450"
                  min="0"
                  onIonInput={(e) => setCalories(e.detail.value || '')}
                />
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {[50, 100, 200].map((extra) => (
                    <IonButton
                      key={extra}
                      size="small"
                      fill="outline"
                      color="primary"
                      style={{ fontSize: '0.72rem', height: '28px', margin: 0 }}
                      onClick={() => {
                        const cur = parseInt(calories, 10) || 0;
                        setCalories((cur + extra).toString());
                      }}
                    >
                      +{extra}
                    </IonButton>
                  ))}
                </div>
              </div>
            </IonItem>

            {/* Optional Macronutrients */}
            <div style={{ margin: '14px 0 6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ion-color-medium)' }}>
                Macronutrientes (Opcional):
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <IonItem lines="none" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked" style={{ fontSize: '0.78rem', color: 'var(--ion-color-primary)' }}>
                    🥩 Proteína (g)
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    value={protein}
                    placeholder="0"
                    onIonInput={(e) => setProtein(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="none" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked" style={{ fontSize: '0.78rem', color: 'var(--ion-color-warning)' }}>
                    🍚 Carbos (g)
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    value={carbs}
                    placeholder="0"
                    onIonInput={(e) => setCarbs(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="none" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked" style={{ fontSize: '0.78rem', color: 'var(--ion-color-danger)' }}>
                    🥑 Grasas (g)
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    value={fat}
                    placeholder="0"
                    onIonInput={(e) => setFat(e.detail.value || '')}
                  />
                </IonItem>
              </div>
            </div>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Notas / Porciones (Opcional)
              </IonLabel>
              <IonTextarea
                value={notes}
                placeholder="ej. Porción de 150g, sin salsas"
                rows={2}
                onIonInput={(e) => setNotes(e.detail.value || '')}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          style={{ fontWeight: 700, marginTop: '10px' }}
          onClick={handleSave}
        >
          <IonIcon slot="start" icon={saveOutline} />
          {entryToEdit ? 'Guardar Cambios' : 'Registrar Comida'}
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

