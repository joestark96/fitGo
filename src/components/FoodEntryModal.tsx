import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IonSearchbar,
  IonChip,
} from '@ionic/react';
import {
  closeOutline,
  saveOutline,
  fastFoodOutline,
  flameOutline,
  sparklesOutline,
  restaurantOutline,
  timeOutline,
  searchOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  cafeOutline,
  moonOutline,
  bookOutline,
  scaleOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { FoodEntry, MealType } from '../types';
import { getLocalDateString } from '../services/storage';
import { DateInput } from './DateInput';
import { DEFAULT_FOOD_CATALOG } from '../data/defaultFoods';
import { FoodCatalogModal } from './FoodCatalogModal';

interface FoodEntryModalProps {
  isOpen: boolean;
  entryToEdit?: FoodEntry | null;
  defaultMealType?: MealType;
  selectedDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSaved: () => void;
}

export interface FoodPresetItem {
  id?: string;
  name: string;
  calories: number;
  meal: MealType;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  portion?: string;
  source: 'history' | 'preset';
  timesLogged?: number;
  lastDate?: string;
}

const QUICK_FOOD_PRESETS: FoodPresetItem[] = DEFAULT_FOOD_CATALOG.map((item) => ({
  id: item.id,
  name: item.name,
  calories: item.calories,
  meal: item.defaultMeal,
  protein: item.protein,
  carbs: item.carbs,
  fat: item.fat,
  portion: item.portion,
  notes: `Porción: ${item.portion}`,
  source: 'preset' as const,
}));

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  entryToEdit,
  defaultMealType = 'almuerzo',
  selectedDate,
  onClose,
  onSaved,
}) => {
  const { saveFoodEntry, foodEntries } = useApp();

  const [date, setDate] = useState(selectedDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null);

  // Search & Suggestions states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<'history' | 'presets'>('history');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Derive unique past foods previously entered by the user
  const userFoodHistory: FoodPresetItem[] = useMemo(() => {
    const map = new Map<string, { entry: FoodEntry; count: number; lastDate: string }>();
    // Sort from newest to oldest
    const sorted = [...foodEntries].sort((a, b) =>
      (b.createdAt || b.date).localeCompare(a.createdAt || a.date)
    );

    for (const f of sorted) {
      if (!f.name || !f.name.trim()) continue;
      const key = f.name.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { entry: f, count: 1, lastDate: f.date });
      } else {
        existing.count++;
        if (f.date > existing.lastDate) {
          existing.entry = f;
          existing.lastDate = f.date;
        }
      }
    }

    // Sort by frequency (most logged first)
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate))
      .map(({ entry, count, lastDate }) => ({
        id: entry.id,
        name: entry.name,
        calories: entry.calories,
        meal: entry.mealType,
        protein: entry.proteinGrams,
        carbs: entry.carbsGrams,
        fat: entry.fatGrams,
        notes: entry.notes,
        source: 'history' as const,
        timesLogged: count,
        lastDate,
      }));
  }, [foodEntries]);

  // Set initial suggestion tab based on whether user has past foods
  useEffect(() => {
    if (userFoodHistory.length > 0) {
      setActiveSuggestionTab('history');
    } else {
      setActiveSuggestionTab('presets');
    }
  }, [userFoodHistory.length, isOpen]);

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
      setLoadedFrom(null);
    } else {
      setDate(selectedDate || getLocalDateString());
      setMealType(defaultMealType);
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setNotes('');
      setLoadedFrom(null);
    }
    setErrorMessage('');
    setSearchQuery('');
  }, [entryToEdit, defaultMealType, selectedDate, isOpen]);

  const handleApplyPreset = (preset: FoodPresetItem) => {
    setName(preset.name);
    setCalories(preset.calories.toString());
    setProtein(preset.protein != null ? preset.protein.toString() : '');
    setCarbs(preset.carbs != null ? preset.carbs.toString() : '');
    setFat(preset.fat != null ? preset.fat.toString() : '');
    if (preset.notes) {
      setNotes(preset.notes);
    }
    setLoadedFrom(`${preset.source === 'history' ? 'Historial' : 'Catálogo'}: ${preset.name} (${preset.calories} kcal)`);
    setSearchQuery('');
    setErrorMessage('');
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

  // Search Results filtering
  const searchResults: FoodPresetItem[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const historyMatches = userFoodHistory.filter((f) =>
      f.name.toLowerCase().includes(q)
    );
    const presetMatches = QUICK_FOOD_PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) &&
        !historyMatches.some((h) => h.name.toLowerCase() === p.name.toLowerCase())
    );

    return [...historyMatches, ...presetMatches].slice(0, 8);
  }, [searchQuery, userFoodHistory]);

  // Autocomplete matches when typing in the "Alimento / Plato" field
  const nameAutocompleteMatches: FoodPresetItem[] = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return [];
    // Do not show if name already exactly matches an item
    const exact = userFoodHistory.find((h) => h.name.toLowerCase() === trimmed);
    if (exact) return [];

    return userFoodHistory
      .filter((h) => h.name.toLowerCase().includes(trimmed))
      .slice(0, 4);
  }, [name, userFoodHistory]);

  // Categorized suggestions
  const userFoodsForCurrentMeal = userFoodHistory.filter((f) => f.meal === mealType);
  const otherUserFoods = userFoodHistory.filter((f) => f.meal !== mealType);
  const userFoodsToDisplay = [...userFoodsForCurrentMeal, ...otherUserFoods];

  const appPresetsForCurrentMeal = QUICK_FOOD_PRESETS.filter((p) => p.meal === mealType);

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
        <IonCard style={{ margin: '0 0 14px', borderRadius: '16px' }}>
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
                <IonSelectOption value="desayuno">Desayuno</IonSelectOption>
                <IonSelectOption value="almuerzo">Almuerzo</IonSelectOption>
                <IonSelectOption value="cena">Cena</IonSelectOption>
                <IonSelectOption value="snack">Snack / Merienda</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Botón para abrir el Catálogo de Alimentos y Porciones */}
        <div
          onClick={() => setIsCatalogOpen(true)}
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            borderRadius: '14px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IonIcon icon={bookOutline} style={{ fontSize: '1.3rem', color: '#38bdf8', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#ffffff' }}>
                Catálogo de Alimentos, Platillos y Porciones
              </div>
              <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                Consulta calorías por porción (taza, gramos, piezas) y elige 0.5x a 2x
              </div>
            </div>
          </div>
          <IonBadge color="primary" style={{ fontSize: '0.72rem', padding: '5px 8px' }}>
            Ver Catálogo
          </IonBadge>
        </div>

        {/* ================= BUSCADOR DE ALIMENTOS ================= */}
        <div style={{ marginBottom: '14px' }}>
          <IonSearchbar
            value={searchQuery}
            placeholder="Buscar en tu historial o catálogo..."
            onIonInput={(e) => setSearchQuery(e.detail.value || '')}
            showClearButton="focus"
            debounce={100}
            style={{
              padding: '0',
              '--background': 'var(--ion-color-step-100, #141a24)',
              '--color': 'var(--ion-text-color, #ffffff)',
              '--placeholder-color': 'var(--ion-color-medium, #94a3b8)',
              '--icon-color': 'var(--ion-color-primary, #3b82f6)',
              '--border-radius': '14px',
            } as React.CSSProperties}
          />

          {/* Active Search Results Dropdown / Panel */}
          {searchQuery.trim().length > 0 && (
            <div
              style={{
                marginTop: '6px',
                background: 'var(--ion-color-step-100, #161d2a)',
                border: '1px solid var(--ion-color-step-200, rgba(255, 255, 255, 0.12))',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxHeight: '280px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--ion-color-medium)',
                  padding: '4px 8px 6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Resultados ({searchResults.length})</span>
                <span
                  style={{ cursor: 'pointer', color: 'var(--ion-color-primary)' }}
                  onClick={() => setSearchQuery('')}
                >
                  Cerrar
                </span>
              </div>

              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'var(--ion-color-step-150, rgba(255,255,255,0.03))',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {item.source === 'history' ? (
                          <IonBadge
                            color="primary"
                            style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '6px' }}
                          >
                            <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                            En tu historial {item.timesLogged ? `(${item.timesLogged}x)` : ''}
                          </IonBadge>
                        ) : (
                          <IonBadge
                            color="warning"
                            style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '6px' }}
                          >
                            <IonIcon icon={sparklesOutline} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                            Sugerencia
                          </IonBadge>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--ion-color-medium)' }}>
                          {item.meal}
                        </span>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: 'var(--ion-text-color, #ffffff)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </div>
                      {(item.portion || item.notes) && (
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                          Porción: {item.portion || item.notes}
                        </div>
                      )}
                      {(item.protein != null || item.carbs != null || item.fat != null) && (
                        <div style={{ fontSize: '0.70rem', color: 'var(--ion-color-medium)', marginTop: '2px' }}>
                          {item.protein != null && <span>P: {item.protein}g • </span>}
                          {item.carbs != null && <span>C: {item.carbs}g • </span>}
                          {item.fat != null && <span>G: {item.fat}g</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--ion-color-primary)' }}>
                        {item.calories}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--ion-color-medium)' }}>kcal</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--ion-color-medium)' }}>
                  <div>No encontramos "{searchQuery}"</div>
                  <IonButton
                    fill="clear"
                    size="small"
                    style={{ marginTop: '4px', fontSize: '0.78rem' }}
                    onClick={() => {
                      setName(searchQuery);
                      setSearchQuery('');
                    }}
                  >
                    Usar "{searchQuery}" como nombre
                  </IonButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= SUGERENCIAS DE ALIMENTOS (HISTORIAL + PRESETS) ================= */}
        <div style={{ marginBottom: '14px' }}>
          {/* Header & Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--ion-color-medium)',
              }}
            >
              <IonIcon
                icon={activeSuggestionTab === 'history' ? timeOutline : sparklesOutline}
                color={activeSuggestionTab === 'history' ? 'primary' : 'warning'}
              />
              <span>
                {activeSuggestionTab === 'history'
                  ? 'Alimentos de tu historial:'
                  : `Sugerencias para ${mealType}:`}
              </span>
            </div>

            {/* Switcher Tab between History and App Presets */}
            {userFoodHistory.length > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--ion-color-step-100, #141a24)',
                  padding: '2px',
                  borderRadius: '12px',
                  border: '1px solid var(--ion-color-step-200, rgba(255,255,255,0.08))',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveSuggestionTab('history')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSuggestionTab === 'history' ? 'var(--ion-color-primary, #3b82f6)' : 'transparent',
                    color: activeSuggestionTab === 'history' ? '#ffffff' : 'var(--ion-color-medium)',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Previos ({userFoodHistory.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSuggestionTab('presets')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSuggestionTab === 'presets' ? 'var(--ion-color-primary, #3b82f6)' : 'transparent',
                    color: activeSuggestionTab === 'presets' ? '#ffffff' : 'var(--ion-color-medium)',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Catálogo
                </button>
              </div>
            )}
          </div>

          {/* Horizontal Chips Carousel */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {activeSuggestionTab === 'history' && userFoodsToDisplay.length > 0 ? (
              userFoodsToDisplay.map((item, idx) => (
                <button
                  key={'hist-' + idx}
                  type="button"
                  onClick={() => handleApplyPreset(item)}
                  style={{
                    background: 'var(--ion-color-step-100, #1e2533)',
                    color: 'var(--ion-text-color, #ffffff)',
                    border: '1px solid var(--ion-color-step-200, rgba(59, 130, 246, 0.25))',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <IonIcon icon={timeOutline} color="primary" style={{ fontSize: '0.85rem' }} />
                  <span>{item.name}</span>
                  {item.timesLogged && item.timesLogged > 1 && (
                    <span
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: 'var(--ion-color-primary)',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.timesLogged}x
                    </span>
                  )}
                  <span style={{ color: 'var(--ion-color-primary)', fontWeight: 800 }}>
                    {item.calories} kcal
                  </span>
                </button>
              ))
            ) : (
              appPresetsForCurrentMeal.map((preset, idx) => (
                <button
                  key={'preset-' + idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    background: 'var(--ion-color-step-100, #1e2533)',
                    color: 'var(--ion-text-color, #ffffff)',
                    border: '1px solid var(--ion-color-step-200, rgba(255,255,255,0.10))',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{preset.name}</span>
                  <span style={{ color: 'var(--ion-color-primary)', fontWeight: 800 }}>
                    {preset.calories} kcal
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Banner when an item was loaded from history or preset */}
        {loadedFrom && (
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '6px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--ion-color-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IonIcon icon={checkmarkCircleOutline} />
              <span>{loadedFrom}</span>
            </div>
            <span
              style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              onClick={() => setLoadedFrom(null)}
            >
              ×
            </span>
          </div>
        )}

        {/* Food Details Form */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '16px', position: 'relative' }}>
          <IonCardContent style={{ padding: '14px' }}>
            {/* Food Name with Live History Autocomplete */}
            <div style={{ position: 'relative' }}>
              <IonItem lines="full">
                <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                  Alimento / Plato *
                </IonLabel>
                <IonInput
                  value={name}
                  placeholder="ej. Pechuga de pollo con arroz"
                  onIonInput={(e) => {
                    setName(e.detail.value || '');
                    setLoadedFrom(null);
                  }}
                  onIonFocus={() => setIsNameFocused(true)}
                  onIonBlur={() => setTimeout(() => setIsNameFocused(false), 200)}
                />
              </IonItem>

              {/* Inline History Autocomplete chips when typing directly in the name input */}
              {isNameFocused && nameAutocompleteMatches.length > 0 && (
                <div
                  style={{
                    background: 'var(--ion-color-step-150, #1a2230)',
                    border: '1px solid var(--ion-color-step-200, rgba(59, 130, 246, 0.35))',
                    borderRadius: '10px',
                    padding: '8px',
                    marginTop: '4px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                    zIndex: 10,
                  }}
                >
                  <div style={{ fontSize: '0.70rem', color: 'var(--ion-color-medium)', marginBottom: '4px', fontWeight: 600 }}>
                    Coincidencias en tus alimentos previos:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {nameAutocompleteMatches.map((match, mIdx) => (
                      <button
                        key={mIdx}
                        type="button"
                        onMouseDown={() => handleApplyPreset(match)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.18)',
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '12px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {match.name} • <strong>{match.calories} kcal</strong>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calories input */}
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
                    Proteína (g)
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
                    Carbos (g)
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
                    Grasas (g)
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
                Notas / Porción consumida (Opcional)
              </IonLabel>
              <IonTextarea
                value={notes}
                placeholder="ej. Porción de 150g, 1 taza cocida, 3 piezas"
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

        {/* Catálogo Completo Modal */}
        <FoodCatalogModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          defaultMealType={mealType}
          actionLabel="Elegir"
          onSelectFood={(sel) => {
            setMealType(sel.mealType);
            setName(sel.name);
            setCalories(sel.calories.toString());
            setProtein(sel.protein.toString());
            setCarbs(sel.carbs.toString());
            setFat(sel.fat.toString());
            setNotes(sel.portionNote);
            setLoadedFrom(`Catálogo: ${sel.name} (${sel.calories} kcal)`);
            setIsCatalogOpen(false);
          }}
        />
      </IonContent>
    </IonModal>
  );
};
