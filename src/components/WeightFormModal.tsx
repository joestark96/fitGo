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
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
  IonAccordionGroup,
  IonAccordion,
  IonTextarea,
  IonText,
} from '@ionic/react';
import {
  closeOutline,
  saveOutline,
  scaleOutline,
  analyticsOutline,
  bodyOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { WeightRecord } from '../types';
import { calculateBmi, getBmiCategory, formatDateDDMMYYYY, getLocalDateString } from '../services/storage';
import { DateInput } from './DateInput';
import { WeightConverterModal } from './WeightConverterModal';

interface WeightFormModalProps {
  isOpen: boolean;
  recordToEdit?: WeightRecord | null;
  onClose: () => void;
  onSaved: (record: WeightRecord) => void;
}

export const WeightFormModal: React.FC<WeightFormModalProps> = ({
  isOpen,
  recordToEdit,
  onClose,
  onSaved,
}) => {
  const { profile, saveWeightRecord, saveProfile } = useApp();

  const [date, setDate] = useState<string>(() => getLocalDateString());
  const [weightKg, setWeightKg] = useState<string>('');
  const [weightLbs, setWeightLbs] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(() => profile?.preferredWeightUnit || 'kg');
  const [showConverterModal, setShowConverterModal] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<string>('170');

  // Optional measurements
  const [waistCm, setWaistCm] = useState<string>('');
  const [hipsCm, setHipsCm] = useState<string>('');
  const [chestCm, setChestCm] = useState<string>('');
  const [armCm, setArmCm] = useState<string>('');
  const [thighCm, setThighCm] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (recordToEdit) {
      setDate(recordToEdit.date);
      setWeightKg(recordToEdit.weightKg.toString());
      setWeightLbs(Number((recordToEdit.weightKg * 2.20462262).toFixed(1)).toString());
      setWeightUnit(profile?.preferredWeightUnit || 'kg');
      setHeightCm(recordToEdit.heightCm.toString());
      setWaistCm(recordToEdit.waistCm ? recordToEdit.waistCm.toString() : '');
      setHipsCm(recordToEdit.hipsCm ? recordToEdit.hipsCm.toString() : '');
      setChestCm(recordToEdit.chestCm ? recordToEdit.chestCm.toString() : '');
      setArmCm(recordToEdit.armCm ? recordToEdit.armCm.toString() : '');
      setThighCm(recordToEdit.thighCm ? recordToEdit.thighCm.toString() : '');
      setBodyFat(recordToEdit.bodyFatPercentage ? recordToEdit.bodyFatPercentage.toString() : '');
      setNotes(recordToEdit.notes || '');
    } else {
      setDate(getLocalDateString());
      setHeightCm(profile?.height ? profile.height.toString() : '170');
      const defaultKg = profile?.targetWeight ? profile.targetWeight.toString() : '70';
      setWeightKg(defaultKg);
      setWeightLbs((parseFloat(defaultKg) * 2.20462).toFixed(1));
      setWeightUnit(profile?.preferredWeightUnit || 'kg');
      setWaistCm('');
      setHipsCm('');
      setChestCm('');
      setArmCm('');
      setThighCm('');
      setBodyFat('');
      setNotes('');
    }
    setErrorMessage('');
  }, [recordToEdit, profile, isOpen]);

  const currentWeightNum = parseFloat(weightKg) || 0;
  const currentHeightNum = parseFloat(heightCm) || 0;
  const calculatedBmi = calculateBmi(currentWeightNum, currentHeightNum);
  const bmiCategory = getBmiCategory(calculatedBmi);

  const handleSave = () => {
    if (!weightKg || currentWeightNum <= 20 || currentWeightNum > 400) {
      setErrorMessage('Por favor ingresa un peso válido en kilogramos (ej. 75.5).');
      return;
    }
    if (!heightCm || currentHeightNum <= 50 || currentHeightNum > 260) {
      setErrorMessage('Por favor ingresa una estatura válida en centímetros (ej. 175).');
      return;
    }
    if (!date) {
      setErrorMessage('Por favor selecciona una fecha.');
      return;
    }

    const record: WeightRecord = {
      id: recordToEdit ? recordToEdit.id : 'weight-' + Date.now(),
      date,
      weightKg: currentWeightNum,
      heightCm: currentHeightNum,
      bmi: calculatedBmi,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      armCm: armCm ? parseFloat(armCm) : undefined,
      thighCm: thighCm ? parseFloat(thighCm) : undefined,
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      notes: notes.trim() || undefined,
      createdAt: recordToEdit ? recordToEdit.createdAt : new Date().toISOString(),
    };

    saveWeightRecord(record);

    // Also update height in profile if it was adjusted
    if (profile && profile.height !== currentHeightNum) {
      saveProfile({
        ...profile,
        height: currentHeightNum,
      });
    }

    onSaved(record);
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
          <IonTitle>{recordToEdit ? 'Editar Medición' : 'Nuevo Registro de Peso'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave} strong>
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

        {/* Real-time BMI Indicator Card */}
        {calculatedBmi > 0 && (
          <IonCard
            style={{
              margin: '0 0 16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%)',
              color: '#fff',
            }}
          >
            <IonCardContent style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Índice de Masa Corporal</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{calculatedBmi}</div>
                </div>
                <div>
                  <IonBadge
                    color={bmiCategory.color}
                    style={{ fontSize: '1rem', padding: '6px 12px', borderRadius: '12px' }}
                  >
                    {bmiCategory.category}
                  </IonBadge>
                  <div style={{ fontSize: '0.8rem', marginTop: '6px', opacity: 0.9 }}>
                    Rango: {bmiCategory.rangeText}
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Required Fields */}
        <IonCard style={{ margin: '0 0 16px', borderRadius: '14px' }}>
          <IonCardContent style={{ padding: '4px 16px' }}>
            <DateInput
              label="Fecha del registro"
              value={date}
              onChange={setDate}
              required
            />

            {/* Weight Input with Unit Selector (kg / lb) and Live Conversion */}
            <div style={{ padding: '10px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <IonLabel style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ion-text-color)' }}>
                  Peso actual *
                </IonLabel>
                
                {/* Unit Switcher & Quick Converter Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowConverterModal(true)}
                    style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.25)',
                      borderRadius: '8px',
                      color: 'var(--ion-color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                    }}
                    title="Convertidor de Libras a Kilos"
                  >
                    <IonIcon icon={swapHorizontalOutline} />
                    Convertidor
                  </button>

                  <div
                    style={{
                      display: 'inline-flex',
                      background: 'var(--ion-color-step-100, #27272a)',
                      borderRadius: '8px',
                      padding: '2px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      style={{
                        background: weightUnit === 'kg' ? 'var(--ion-color-primary)' : 'transparent',
                        color: weightUnit === 'kg' ? '#fff' : 'var(--ion-color-medium)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWeightUnit('lb');
                        const k = parseFloat(weightKg);
                        if (!isNaN(k) && k > 0) {
                          setWeightLbs((k * 2.20462).toFixed(1));
                        }
                      }}
                      style={{
                        background: weightUnit === 'lb' ? 'var(--ion-color-primary)' : 'transparent',
                        color: weightUnit === 'lb' ? '#fff' : 'var(--ion-color-medium)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      lb
                    </button>
                  </div>
                </div>
              </div>

              {weightUnit === 'kg' ? (
                <>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej. 74.5"
                    value={weightKg}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--ion-background-color, #121215)',
                      borderRadius: '10px',
                      border: '1px solid var(--ion-color-step-150, #27272a)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      padding: '8px 12px',
                      color: 'var(--ion-text-color, #ffffff)',
                      outline: 'none',
                    }}
                    onChange={(e) => {
                      let val = e.target.value.replace(/,/g, '.');
                      if (!/^[0-9]*\.?[0-9]*$/.test(val)) return;
                      setWeightKg(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num > 0) {
                        setWeightLbs((num * 2.20462).toFixed(1));
                      } else {
                        setWeightLbs('');
                      }
                    }}
                  />
                  {currentWeightNum > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--ion-color-medium)', marginTop: '4px', fontWeight: 600 }}>
                      Equivalente: <strong style={{ color: 'var(--ion-text-color)' }}>{(currentWeightNum * 2.20462).toFixed(1)} lb</strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej. 165"
                    value={weightLbs}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--ion-background-color, #121215)',
                      borderRadius: '10px',
                      border: '1px solid var(--ion-color-step-150, #27272a)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      padding: '8px 12px',
                      color: 'var(--ion-text-color, #ffffff)',
                      outline: 'none',
                    }}
                    onChange={(e) => {
                      let val = e.target.value.replace(/,/g, '.');
                      if (!/^[0-9]*\.?[0-9]*$/.test(val)) return;
                      setWeightLbs(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num > 0) {
                        setWeightKg(Number((num / 2.20462262).toFixed(2)).toString());
                      } else {
                        setWeightKg('');
                      }
                    }}
                  />
                  {parseFloat(weightLbs) > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--ion-color-primary)', marginTop: '4px', fontWeight: 700 }}>
                      Equivalente guardado: <strong>{weightKg} kg</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <IonItem lines="none" style={{ marginTop: '4px' }}>
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Estatura (cm) *
              </IonLabel>
              <IonInput
                type="number"
                placeholder="Ej. 175"
                value={heightCm}
                onIonInput={(e) => setHeightCm(e.detail.value || '')}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Optional Measurements Accordion (Requirement 3: otras medidas opcionales) */}
        <IonAccordionGroup style={{ marginBottom: '16px' }}>
          <IonAccordion value="optional_measurements">
            <IonItem slot="header" color="light" lines="full">
              <IonIcon slot="start" icon={bodyOutline} color="primary" />
              <IonLabel style={{ fontWeight: 600 }}>Medidas Corporales Opcionales</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content" style={{ background: 'var(--ion-item-background, #fff)' }}>
              <IonText color="medium">
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem' }}>
                  Ingresa las medidas en centímetros para un seguimiento corporal más detallado.
                </p>
              </IonText>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <IonItem lines="full">
                  <IonLabel position="stacked">Cintura (cm)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    placeholder="Ej. 82"
                    value={waistCm}
                    onIonInput={(e) => setWaistCm(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="full">
                  <IonLabel position="stacked">Cadera (cm)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    placeholder="Ej. 98"
                    value={hipsCm}
                    onIonInput={(e) => setHipsCm(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="full">
                  <IonLabel position="stacked">Pecho (cm)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    placeholder="Ej. 102"
                    value={chestCm}
                    onIonInput={(e) => setChestCm(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="full">
                  <IonLabel position="stacked">Brazo (cm)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    placeholder="Ej. 36"
                    value={armCm}
                    onIonInput={(e) => setArmCm(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="full">
                  <IonLabel position="stacked">Muslo (cm)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.5"
                    placeholder="Ej. 56"
                    value={thighCm}
                    onIonInput={(e) => setThighCm(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="full">
                  <IonLabel position="stacked">% Grasa</IonLabel>
                  <IonInput
                    type="number"
                    step="0.1"
                    placeholder="Ej. 18.5"
                    value={bodyFat}
                    onIonInput={(e) => setBodyFat(e.detail.value || '')}
                  />
                </IonItem>
              </div>

              <IonItem lines="none" style={{ marginTop: '8px' }}>
                <IonLabel position="stacked">Notas u observaciones</IonLabel>
                <IonTextarea
                  placeholder="Ej. Medición matutina después del cardio..."
                  value={notes}
                  rows={2}
                  onIonInput={(e) => setNotes(e.detail.value || '')}
                />
              </IonItem>
            </div>
          </IonAccordion>
        </IonAccordionGroup>

        <div style={{ marginTop: '16px', paddingBottom: '24px' }}>
          <IonButton
            expand="block"
            size="large"
            style={{ fontWeight: 600, borderRadius: '12px' }}
            onClick={handleSave}
          >
            <IonIcon slot="start" icon={saveOutline} />
            {recordToEdit ? 'Actualizar Registro' : 'Guardar Medición'}
          </IonButton>
        </div>
      </IonContent>

      <WeightConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        initialKg={currentWeightNum > 0 ? currentWeightNum : undefined}
        onApplyKg={(kg) => {
          setWeightKg(kg.toString());
          setWeightLbs((kg * 2.20462).toFixed(1));
        }}
      />
    </IonModal>
  );
};

