import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonAlert,
  IonToast,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  addOutline,
  chevronBackOutline,
  chevronForwardOutline,
  flameOutline,
  restaurantOutline,
  trashOutline,
  createOutline,
  informationCircleOutline,
  nutritionOutline,
  speedometerOutline,
  sunnyOutline,
  moonOutline,
  cafeOutline,
  fastFoodOutline,
  footstepsOutline,
  barbellOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { FoodEntry, MealType, ActivityLevel, DailyActivity } from '../types';
import { formatDateDDMMYYYY, getLocalDateString, addDaysToDateString } from '../services/storage';
import { FoodEntryModal } from '../components/FoodEntryModal';
import { AppHeader } from '../components/AppHeader';

export const NutritionPage: React.FC = () => {
  const {
    foodEntries,
    deleteFoodEntry,
    calorieRecommendation,
    activityLevel,
    setActivityLevel,
    dailyActivities,
    saveDailyActivity,
    profile,
  } = useApp();

  // Current selected date in YYYY-MM-DD (device local date, avoiding UTC shift)
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActivityAlert, setShowActivityAlert] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<FoodEntry | null>(null);
  const [defaultMealType, setDefaultMealType] = useState<MealType>('almuerzo');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Navigate dates
  const handlePrevDay = () => {
    setSelectedDate((prev) => addDaysToDateString(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDaysToDateString(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(getLocalDateString());
  };

  // Filter entries for the selected day
  const dayEntries = foodEntries.filter((f) => f.date === selectedDate);

  // Activity (calories burned & steps) on selected day
  const dayActivity = dailyActivities.find((a) => a.date === selectedDate);
  const totalCaloriesBurned = dayActivity?.caloriesBurned || 0;
  const totalSteps = dayActivity?.steps || 0;

  const totalCaloriesConsumed = dayEntries.reduce((sum, item) => sum + item.calories, 0);
  const netCalories = Math.max(0, totalCaloriesConsumed - totalCaloriesBurned);
  const targetCalories = calorieRecommendation.targetCalories;
  const remainingCalories = targetCalories - netCalories;
  const progressRatio = targetCalories > 0 ? Math.min(netCalories / targetCalories, 1.25) : 0;

  // Macros totals
  const totalProtein = dayEntries.reduce((sum, item) => sum + (item.proteinGrams || 0), 0);
  const totalCarbs = dayEntries.reduce((sum, item) => sum + (item.carbsGrams || 0), 0);
  const totalFat = dayEntries.reduce((sum, item) => sum + (item.fatGrams || 0), 0);

  const openCreateModal = (meal: MealType) => {
    setEntryToEdit(null);
    setDefaultMealType(meal);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: FoodEntry) => {
    setEntryToEdit(entry);
    setDefaultMealType(entry.mealType);
    setIsModalOpen(true);
  };

  const isToday = selectedDate === getLocalDateString();

  const mealConfig: { type: MealType; title: string; icon: string; emoji: string }[] = [
    { type: 'desayuno', title: 'Desayuno', icon: cafeOutline, emoji: '🌅' },
    { type: 'almuerzo', title: 'Almuerzo', icon: restaurantOutline, emoji: '🍽️' },
    { type: 'cena', title: 'Cena', icon: moonOutline, emoji: '🌙' },
    { type: 'snack', title: 'Snacks / Colación', icon: fastFoodOutline, emoji: '🥪' },
  ];

  return (
    <IonPage>
      <AppHeader
        subtitle="Calorías & Macros"
        rightAction={
          <IonButton
            fill="clear"
            size="small"
            onClick={() => openCreateModal('almuerzo')}
            style={{
              background: 'rgba(14, 165, 233, 0.12)',
              borderRadius: '12px',
              fontWeight: 700,
              color: 'var(--ion-color-primary)',
            }}
          >
            <IonIcon slot="start" icon={addOutline} />
            Comida
          </IonButton>
        }
      />

      <IonContent className="ion-padding" fullscreen>
        {/* Date Selector Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--ion-card-background, var(--ion-color-step-50, #f8fafc))',
            borderRadius: '18px',
            padding: '8px 12px',
            marginBottom: '16px',
            border: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          }}
        >
          <IonButton fill="clear" size="small" onClick={handlePrevDay} style={{ height: '36px', width: '36px' }}>
            <IonIcon slot="icon-only" icon={chevronBackOutline} />
          </IonButton>

          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleToday}>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.2px' }}>
              {isToday ? 'Hoy, ' : ''}
              {formatDateDDMMYYYY(selectedDate)}
            </div>
            {!isToday && (
              <span style={{ fontSize: '0.74rem', color: 'var(--ion-color-primary)', fontWeight: 700 }}>
                (Toca para volver a hoy)
              </span>
            )}
          </div>

          <IonButton fill="clear" size="small" onClick={handleNextDay} style={{ height: '36px', width: '36px' }}>
            <IonIcon slot="icon-only" icon={chevronForwardOutline} />
          </IonButton>
        </div>

        {/* Main Calorie Budget Card */}
        <IonCard
          style={{
            margin: '0 0 16px',
            borderRadius: '16px',
          }}
        >
          <IonCardContent style={{ padding: '20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ion-color-medium)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  Calorías Netas / Meta
                </span>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, margin: '4px 0', letterSpacing: '-0.8px' }}>
                  {netCalories}
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ion-color-medium)', marginLeft: '6px' }}>
                    / {targetCalories} kcal
                  </span>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: remainingCalories >= 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                  border: remainingCalories >= 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: remainingCalories >= 0 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)', letterSpacing: '0.5px' }}>
                  {remainingCalories >= 0 ? 'DISPONIBLE' : 'EXCESO'}
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: remainingCalories >= 0 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)',
                  }}
                >
                  {Math.abs(remainingCalories)} kcal
                </div>
              </div>
            </div>

            {/* Quick 3-Pill Breakdown: Consumidas, Quemadas, Pasos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                marginTop: '14px',
              }}
            >
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.22)',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 800 }}>
                  COMIDA
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  {totalCaloriesConsumed}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>kcal</div>
              </div>

              <div
                onClick={() => setShowActivityAlert(true)}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                title="Toca para ingresar o ajustar calorías quemadas"
              >
                <div style={{ fontSize: '0.68rem', color: '#f87171', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <IonIcon icon={flameOutline} style={{ fontSize: '0.8rem' }} />
                  QUEMADAS
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f87171', marginTop: '2px' }}>
                  -{totalCaloriesBurned}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 700 }}>kcal ✎</div>
              </div>

              <div
                onClick={() => setShowActivityAlert(true)}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                title="Toca para ingresar o ajustar pasos"
              >
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <IonIcon icon={footstepsOutline} style={{ fontSize: '0.8rem' }} />
                  PASOS
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                  {totalSteps.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 700 }}>pasos ✎</div>
              </div>
            </div>

            {/* Quick helper to log activity */}
            <div
              onClick={() => setShowActivityAlert(true)}
              style={{
                marginTop: '10px',
                padding: '7px 10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px dashed rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '0.76rem',
                color: '#fca5a5',
                fontWeight: 600,
              }}
            >
              <span>⌚ Toca aquí para registrar calorías quemadas y pasos (Smartwatch)</span>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ marginTop: '12px' }}>
              <IonProgressBar
                value={Math.min(progressRatio, 1)}
                color={remainingCalories >= 0 ? 'primary' : 'danger'}
                style={{ height: '10px', borderRadius: '5px' }}
              />
            </div>

            {/* Macros summary breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.08))',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-primary)', fontWeight: 700 }}>
                  PROTEÍNA
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
                  {totalProtein.toFixed(0)} <span style={{ fontSize: '0.75rem' }}>g</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-warning)', fontWeight: 700 }}>
                  CARBOS
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
                  {totalCarbs.toFixed(0)} <span style={{ fontSize: '0.75rem' }}>g</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-danger)', fontWeight: 700 }}>
                  GRASAS
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
                  {totalFat.toFixed(0)} <span style={{ fontSize: '0.75rem' }}>g</span>
                </div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Nutritional IMC Recommendation Accordion Card */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '16px' }}>
          <IonCardHeader style={{ padding: '14px 16px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle style={{ fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IonIcon icon={speedometerOutline} color="primary" />
                Cálculo según tu IMC y Perfil
              </IonCardTitle>
              <IonButton
                fill="clear"
                size="small"
                color="medium"
                onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              >
                <IonIcon slot="icon-only" icon={informationCircleOutline} />
              </IonButton>
            </div>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0 16px 14px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--ion-text-color)' }}>
              {calorieRecommendation.adjustmentReason}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <IonBadge color="primary" style={{ padding: '4px 8px' }}>
                IMC: {calorieRecommendation.bmi} ({calorieRecommendation.bmiCategory})
              </IonBadge>
              <IonBadge color="secondary" style={{ padding: '4px 8px' }}>
                Gasto Basal (TMB): {calorieRecommendation.bmr} kcal
              </IonBadge>
              <IonBadge color="tertiary" style={{ padding: '4px 8px' }}>
                Mantenimiento: {calorieRecommendation.tdee} kcal
              </IonBadge>
              {profile?.targetWeight && (
                <IonBadge color="warning" style={{ padding: '4px 8px' }}>
                  🎯 Peso objetivo: {profile.targetWeight} kg
                </IonBadge>
              )}
            </div>

            {/* Activity Level Selector */}
            <IonItem lines="none" style={{ '--padding-start': '0', marginTop: '6px' }}>
              <IonLabel position="stacked" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Nivel de actividad física diaria:
              </IonLabel>
              <IonSelect
                value={activityLevel}
                interface="popover"
                onIonChange={(e) => setActivityLevel(e.detail.value as ActivityLevel)}
                style={{ width: '100%' }}
              >
                <IonSelectOption value="sedentary">🛋️ Sedentario (poco o nada)</IonSelectOption>
                <IonSelectOption value="light">🚶 Ligero (1-3 días de ejercicio)</IonSelectOption>
                <IonSelectOption value="moderate">🏃 Moderado (3-5 días de ejercicio)</IonSelectOption>
                <IonSelectOption value="active">🏋️ Activo (6-7 días de ejercicio intenso)</IonSelectOption>
                <IonSelectOption value="very_active">⚡ Muy activo (trabajo físico + pesas)</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Breakdown by Meals */}
        {mealConfig.map((meal) => {
          const entries = dayEntries.filter((f) => f.mealType === meal.type);
          const mealTotalKcal = entries.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <IonCard key={meal.type} style={{ margin: '0 0 14px', borderRadius: '16px' }}>
              <IonCardHeader style={{ padding: '14px 16px 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{meal.emoji}</span>
                    <IonCardTitle style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                      {meal.title}
                    </IonCardTitle>
                    <IonBadge color="medium" style={{ fontSize: '0.75rem' }}>
                      {mealTotalKcal} kcal
                    </IonBadge>
                  </div>

                  <IonButton
                    size="small"
                    fill="outline"
                    color="primary"
                    style={{ margin: 0, fontWeight: 600, height: '30px' }}
                    onClick={() => openCreateModal(meal.type)}
                  >
                    <IonIcon slot="start" icon={addOutline} />
                    Agregar
                  </IonButton>
                </div>
              </IonCardHeader>

              <IonCardContent style={{ padding: '0 16px 12px' }}>
                {entries.length === 0 ? (
                  <div
                    style={{
                      padding: '12px 0',
                      textAlign: 'center',
                      color: 'var(--ion-color-medium)',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No has registrado alimentos en {meal.title.toLowerCase()}.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--ion-color-step-100, rgba(255,255,255,0.06))',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ion-text-color)' }}>
                          {entry.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span style={{ color: 'var(--ion-color-primary)', fontWeight: 700 }}>
                            {entry.calories} kcal
                          </span>
                          {entry.proteinGrams !== undefined && (
                            <span>P: {entry.proteinGrams}g</span>
                          )}
                          {entry.carbsGrams !== undefined && (
                            <span>C: {entry.carbsGrams}g</span>
                          )}
                          {entry.fatGrams !== undefined && (
                            <span>G: {entry.fatGrams}g</span>
                          )}
                        </div>
                        {entry.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)', fontStyle: 'italic' }}>
                            {entry.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <IonButton
                          fill="clear"
                          size="small"
                          color="medium"
                          onClick={() => openEditModal(entry)}
                        >
                          <IonIcon slot="icon-only" icon={createOutline} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          size="small"
                          color="danger"
                          onClick={() => setEntryToDelete(entry.id)}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                      </div>
                    </div>
                  ))
                )}
              </IonCardContent>
            </IonCard>
          );
        })}

        {/* Modal for adding/editing food entry */}
        <FoodEntryModal
          isOpen={isModalOpen}
          entryToEdit={entryToEdit}
          defaultMealType={defaultMealType}
          selectedDate={selectedDate}
          onClose={() => {
            setIsModalOpen(false);
            setEntryToEdit(null);
          }}
          onSaved={() => {
            setToastMessage('Comida registrada correctamente 🍽️');
          }}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={Boolean(entryToDelete)}
          onDidDismiss={() => setEntryToDelete(null)}
          header="¿Eliminar alimento?"
          message="¿Seguro que deseas eliminar este registro de comida?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: () => {
                if (entryToDelete) {
                  deleteFoodEntry(entryToDelete);
                  setToastMessage('Alimento eliminado.');
                }
              },
            },
          ]}
        />

        {/* Scientific Explanation Alert */}
        <IonAlert
          isOpen={showFormulaInfo}
          onDidDismiss={() => setShowFormulaInfo(false)}
          header="📐 Ciencia de tus Calorías"
          message={`Tus calorías se calculan con la fórmula Mifflin-St Jeor (reconocida médicamente como la más precisa):\n\n1. Tasa Metabólica Basal (TMB): Calorías que quemas en reposo según tu peso, estatura, edad y sexo.\n2. Gasto Energético Total (GET): TMB multiplicado por tu factor de actividad física.\n3. Ajuste por IMC (${calorieRecommendation.bmi}) y Objetivo (${profile?.targetWeight ? profile.targetWeight + ' kg' : 'Saludable'}): Se aplica un déficit o superávit seguro para optimizar tu composición corporal sin perjudicar tu metabolismo.`}
          buttons={['Entendido']}
        />

        {/* Activity & Steps Registration / Adjustment Alert */}
        <IonAlert
          isOpen={showActivityAlert}
          onDidDismiss={() => setShowActivityAlert(false)}
          header="Actividad & Pasos del Día"
          subHeader={formatDateDDMMYYYY(selectedDate)}
          message="Ingresa o ajusta los pasos y calorías quemadas totales del día marcadas por tu smartwatch o pulsera."
          inputs={[
            {
              name: 'steps',
              type: 'number',
              placeholder: 'Pasos del día (ej. 8500)',
              value: totalSteps > 0 ? String(totalSteps) : '',
              min: 0,
            },
            {
              name: 'caloriesBurned',
              type: 'number',
              placeholder: 'Calorías quemadas totales (kcal)',
              value: totalCaloriesBurned > 0 ? String(totalCaloriesBurned) : '',
              min: 0,
            },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Guardar',
              handler: (data) => {
                const sNum = parseInt(data.steps, 10);
                const cNum = parseInt(data.caloriesBurned, 10);
                saveDailyActivity({
                  date: selectedDate,
                  steps: !isNaN(sNum) && sNum >= 0 ? sNum : undefined,
                  caloriesBurned: !isNaN(cNum) && cNum >= 0 ? cNum : undefined,
                });
                setToastMessage('Actividad y pasos del día actualizados 👟🔥');
              },
            },
          ]}
        />

        {/* Toast */}
        <IonToast
          isOpen={Boolean(toastMessage)}
          message={toastMessage || ''}
          duration={2000}
          onDidDismiss={() => setToastMessage(null)}
          position="bottom"
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default NutritionPage;

