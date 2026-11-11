import React, { useState, useMemo, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonInput,
} from '@ionic/react';
import {
  closeOutline,
  addOutline,
  restaurantOutline,
  scaleOutline,
  checkmarkCircleOutline,
  trashOutline,
  bookOutline,
  flameOutline,
} from 'ionicons/icons';
import {
  DEFAULT_FOOD_CATALOG,
  FOOD_CATEGORY_LABELS,
  FoodCategory,
  CatalogFoodItem,
} from '../data/defaultFoods';
import { MealType } from '../types';

const CUSTOM_CATALOG_KEY = 'fittrack_custom_food_catalog';

function loadCustomCatalogFoods(): CatalogFoodItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomCatalogFoods(items: CatalogFoodItem[]): void {
  try {
    localStorage.setItem(CUSTOM_CATALOG_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

interface FoodCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  /**
   * Called when the user selects/adds a food item from the catalog with a chosen multiplier & meal
   */
  onSelectFood: (selection: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portionNote: string;
    mealType: MealType;
  }) => void;
  /**
   * Action label on each item button (e.g. "Registrar" when opened from NutritionPage, or "Elegir" when opened from FoodEntryModal)
   */
  actionLabel?: string;
}

const PORTION_MULTIPLIERS = [
  { value: 0.5, label: '½ porción (0.5x)' },
  { value: 1, label: '1 porción (1x)' },
  { value: 1.5, label: '1½ porciones (1.5x)' },
  { value: 2, label: '2 porciones (2x)' },
];

export const FoodCatalogModal: React.FC<FoodCatalogModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'almuerzo',
  onSelectFood,
  actionLabel = 'Agregar',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMealType);
  const [multiplierMap, setMultiplierMap] = useState<Record<string, number>>({});
  const [customFoods, setCustomFoods] = useState<CatalogFoodItem[]>(() => loadCustomCatalogFoods());

  // State for creating a new custom catalog item
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FoodCategory>('platillos');
  const [newPortion, setNewPortion] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newFat, setNewFat] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMeal(defaultMealType);
      setCustomFoods(loadCustomCatalogFoods());
    }
  }, [isOpen, defaultMealType]);

  const allCatalogItems = useMemo(() => {
    return [...customFoods, ...DEFAULT_FOOD_CATALOG];
  }, [customFoods]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCatalogItems.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.portion.toLowerCase().includes(q) ||
        FOOD_CATEGORY_LABELS[item.category].toLowerCase().includes(q)
      );
    });
  }, [allCatalogItems, selectedCategory, searchQuery]);

  const getMultiplier = (id: string) => multiplierMap[id] || 1;

  const setItemMultiplier = (id: string, mult: number) => {
    setMultiplierMap((prev) => ({ ...prev, [id]: mult }));
  };

  const handleChooseItem = (item: CatalogFoodItem) => {
    const mult = getMultiplier(item.id);
    const scaledCalories = Math.round(item.calories * mult);
    const scaledProtein = Number((item.protein * mult).toFixed(1));
    const scaledCarbs = Number((item.carbs * mult).toFixed(1));
    const scaledFat = Number((item.fat * mult).toFixed(1));
    const portionNote =
      mult === 1
        ? `Porción: ${item.portion}`
        : `Porción (${mult}x): ${item.portion}`;

    onSelectFood({
      name: mult === 1 ? item.name : `${item.name} (${mult}x)`,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat,
      portionNote,
      mealType: selectedMeal,
    });
  };

  const handleSaveCustomCatalogFood = () => {
    if (!newName.trim()) {
      setFormError('Ingresa el nombre del alimento o platillo.');
      return;
    }
    if (!newPortion.trim()) {
      setFormError('Ingresa la porción aproximada (ej. 1 plato, 150 g, 2 piezas).');
      return;
    }
    const cal = parseInt(newCalories, 10);
    if (isNaN(cal) || cal <= 0) {
      setFormError('Ingresa las calorías por porción.');
      return;
    }

    const created: CatalogFoodItem = {
      id: `custom-food-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      defaultMeal: selectedMeal,
      portion: newPortion.trim(),
      calories: cal,
      protein: parseFloat(newProtein) || 0,
      carbs: parseFloat(newCarbs) || 0,
      fat: parseFloat(newFat) || 0,
      isCustom: true,
    };

    const updated = [created, ...customFoods];
    setCustomFoods(updated);
    saveCustomCatalogFoods(updated);

    setNewName('');
    setNewPortion('');
    setNewCalories('');
    setNewProtein('');
    setNewCarbs('');
    setNewFat('');
    setFormError('');
    setShowCreateForm(false);
  };

  const handleDeleteCustomFood = (id: string) => {
    const updated = customFoods.filter((f) => f.id !== id);
    setCustomFoods(updated);
    saveCustomCatalogFoods(updated);
  };

  const categories: { key: FoodCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'platillos', label: 'Platillos' },
    { key: 'proteinas', label: 'Proteínas' },
    { key: 'carbohidratos', label: 'Carbohidratos' },
    { key: 'frutas_verduras', label: 'Frutas y Verduras' },
    { key: 'grasas_lacteos', label: 'Lácteos y Grasas' },
    { key: 'snacks_suplementos', label: 'Snacks y Suplementos' },
  ];

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={bookOutline} />
              <span>Catálogo de Alimentos y Porciones</span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Top Controls: Meal Target & Create Custom Dish Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '14px',
            padding: '10px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
            <IonIcon icon={restaurantOutline} color="primary" style={{ fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Registrar en:
            </span>
            <IonSelect
              value={selectedMeal}
              interface="popover"
              onIonChange={(e) => setSelectedMeal(e.detail.value)}
              style={{
                fontWeight: 800,
                fontSize: '0.85rem',
                color: '#38bdf8',
                '--padding-start': '4px',
                '--padding-end': '4px',
              } as React.CSSProperties}
            >
              <IonSelectOption value="desayuno">Desayuno</IonSelectOption>
              <IonSelectOption value="almuerzo">Almuerzo</IonSelectOption>
              <IonSelectOption value="cena">Cena</IonSelectOption>
              <IonSelectOption value="snack">Snacks / Colación</IonSelectOption>
            </IonSelect>
          </div>

          <IonButton
            size="small"
            fill={showCreateForm ? 'solid' : 'outline'}
            color="primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ margin: 0, fontWeight: 700, height: '32px' }}
          >
            <IonIcon slot="start" icon={addOutline} />
            {showCreateForm ? 'Cerrar Formulario' : 'Nuevo Platillo'}
          </IonButton>
        </div>

        {/* Optional Form to Add a Custom Dish/Food to the Catalog */}
        {showCreateForm && (
          <IonCard
            style={{
              margin: '0 0 14px',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(15, 23, 42, 0.9)',
            }}
          >
            <IonCardContent style={{ padding: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff', marginBottom: '10px' }}>
                Guardar Nuevo Alimento o Platillo en el Catálogo
              </div>

              {formError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    marginBottom: '10px',
                  }}
                >
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gap: '8px' }}>
                <IonInput
                  label="Nombre del alimento o platillo *"
                  labelPlacement="stacked"
                  placeholder="Ej. Enchiladas suizas caseras"
                  value={newName}
                  onIonInput={(e) => setNewName(e.detail.value || '')}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    borderRadius: '10px',
                    '--padding-start': '10px',
                  } as React.CSSProperties}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <IonInput
                    label="Porción de referencia *"
                    labelPlacement="stacked"
                    placeholder="Ej. 3 piezas / 1 taza (150g)"
                    value={newPortion}
                    onIonInput={(e) => setNewPortion(e.detail.value || '')}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      '--padding-start': '10px',
                    } as React.CSSProperties}
                  />

                  <IonInput
                    type="number"
                    label="Calorías (kcal) *"
                    labelPlacement="stacked"
                    placeholder="Ej. 420"
                    value={newCalories}
                    onIonInput={(e) => setNewCalories(e.detail.value || '')}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      '--padding-start': '10px',
                    } as React.CSSProperties}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <IonInput
                    type="number"
                    label="Proteína (g)"
                    labelPlacement="stacked"
                    placeholder="0"
                    value={newProtein}
                    onIonInput={(e) => setNewProtein(e.detail.value || '')}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      '--padding-start': '10px',
                    } as React.CSSProperties}
                  />
                  <IonInput
                    type="number"
                    label="Carbos (g)"
                    labelPlacement="stacked"
                    placeholder="0"
                    value={newCarbs}
                    onIonInput={(e) => setNewCarbs(e.detail.value || '')}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      '--padding-start': '10px',
                    } as React.CSSProperties}
                  />
                  <IonInput
                    type="number"
                    label="Grasas (g)"
                    labelPlacement="stacked"
                    placeholder="0"
                    value={newFat}
                    onIonInput={(e) => setNewFat(e.detail.value || '')}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      '--padding-start': '10px',
                    } as React.CSSProperties}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <IonSelect
                    value={newCategory}
                    interface="popover"
                    onIonChange={(e) => setNewCategory(e.detail.value)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      fontSize: '0.82rem',
                      flex: 1,
                    }}
                  >
                    <IonSelectOption value="platillos">Categoría: Platillos</IonSelectOption>
                    <IonSelectOption value="proteinas">Categoría: Proteínas</IonSelectOption>
                    <IonSelectOption value="carbohidratos">Categoría: Carbohidratos</IonSelectOption>
                    <IonSelectOption value="frutas_verduras">Categoría: Frutas y Verduras</IonSelectOption>
                    <IonSelectOption value="grasas_lacteos">Categoría: Lácteos y Grasas</IonSelectOption>
                    <IonSelectOption value="snacks_suplementos">Categoría: Snacks y Suplementos</IonSelectOption>
                  </IonSelect>

                  <IonButton size="small" color="success" onClick={handleSaveCustomCatalogFood} style={{ fontWeight: 700 }}>
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    Guardar en Catálogo
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Searchbar */}
        <IonSearchbar
          value={searchQuery}
          placeholder="Buscar alimento, platillo o porción (ej. tacos, pollo, taza)..."
          onIonInput={(e) => setSearchQuery(e.detail.value || '')}
          debounce={80}
          style={{
            padding: '0 0 10px 0',
            '--background': 'var(--ion-color-step-100, #141a24)',
            '--color': 'var(--ion-text-color, #ffffff)',
            '--border-radius': '14px',
          } as React.CSSProperties}
        />

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '12px',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '6px 13px',
                  borderRadius: '14px',
                  border: active
                    ? '1.5px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: active
                    ? 'rgba(56, 189, 248, 0.18)'
                    : 'rgba(15, 23, 42, 0.6)',
                  color: active ? '#ffffff' : '#94a3b8',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Count summary */}
        <div
          style={{
            fontSize: '0.76rem',
            color: 'var(--ion-color-medium)',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            Mostrando <strong>{filteredItems.length}</strong> alimentos con porción de referencia
          </span>
          <span>Ajusta 0.5x a 2x según tu porción</span>
        </div>

        {/* Food Catalog List */}
        {filteredItems.map((item) => {
          const mult = getMultiplier(item.id);
          const displayCal = Math.round(item.calories * mult);
          const displayProt = Number((item.protein * mult).toFixed(1));
          const displayCarbs = Number((item.carbs * mult).toFixed(1));
          const displayFat = Number((item.fat * mult).toFixed(1));

          return (
            <IonCard
              key={item.id}
              style={{
                margin: '0 0 12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <IonCardContent style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <IonBadge
                        color="medium"
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        {FOOD_CATEGORY_LABELS[item.category]}
                      </IonBadge>
                      {item.isCustom && (
                        <IonBadge color="primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          Personalizado
                        </IonBadge>
                      )}
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.98rem',
                        color: 'var(--ion-text-color)',
                        lineHeight: 1.25,
                      }}
                    >
                      {item.name}
                    </div>

                    {/* Approx Portion Box */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '6px',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        borderRadius: '10px',
                        padding: '5px 9px',
                        fontSize: '0.78rem',
                        color: '#bae6fd',
                        fontWeight: 600,
                      }}
                    >
                      <IonIcon icon={scaleOutline} style={{ fontSize: '0.95rem', flexShrink: 0, color: '#38bdf8' }} />
                      <span>
                        <strong>1 porción:</strong> {item.portion}
                      </span>
                    </div>
                  </div>

                  {/* Calorie Badge on the right */}
                  <div
                    style={{
                      textAlign: 'right',
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '6px 10px',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '3px',
                      }}
                    >
                      <IonIcon icon={flameOutline} style={{ fontSize: '0.95rem' }} />
                      {displayCal}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 700 }}>
                      kcal ({mult}x)
                    </div>
                  </div>
                </div>

                {/* Macros Strip */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '10px',
                    fontSize: '0.76rem',
                    color: 'var(--ion-color-medium)',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: '#60a5fa' }}>Proteína: {displayProt} g</span>
                  <span style={{ color: '#fbbf24' }}>Carbos: {displayCarbs} g</span>
                  <span style={{ color: '#f87171' }}>Grasas: {displayFat} g</span>
                </div>

                {/* Portion Multiplier Pills + Action Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {PORTION_MULTIPLIERS.map((m) => {
                      const isSel = mult === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setItemMultiplier(item.id, m.value)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '8px',
                            border: isSel
                              ? '1px solid #38bdf8'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            background: isSel ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                            color: isSel ? '#38bdf8' : '#94a3b8',
                            fontWeight: 800,
                            fontSize: '0.73rem',
                            cursor: 'pointer',
                          }}
                        >
                          {m.value}x
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.isCustom && (
                      <IonButton
                        size="small"
                        fill="clear"
                        color="danger"
                        onClick={() => handleDeleteCustomFood(item.id)}
                        style={{ margin: 0, height: '30px' }}
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    )}

                    <IonButton
                      size="small"
                      color="primary"
                      onClick={() => handleChooseItem(item)}
                      style={{ margin: 0, fontWeight: 700, height: '30px' }}
                    >
                      <IonIcon slot="start" icon={addOutline} />
                      {actionLabel} ({displayCal} kcal)
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          );
        })}
      </IonContent>
    </IonModal>
  );
};
