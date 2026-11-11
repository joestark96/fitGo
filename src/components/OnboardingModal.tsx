import React, { useState, useEffect, useMemo } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonBadge,
} from '@ionic/react';
import { personCircleOutline, checkmarkCircleOutline, sparklesOutline, refreshOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { Gender, UserProfile } from '../types';
import { getSuggestedTargetWeight } from '../services/storage';
import { DateInput } from './DateInput';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { saveProfile } = useApp();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<string>('170');
  const [initialWeight, setInitialWeight] = useState<string>('70');
  const [targetWeight, setTargetWeight] = useState<string>('70');
  const [weekStartDay, setWeekStartDay] = useState<number>(1);
  const [hasManualTargetEdited, setHasManualTargetEdited] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sugerencia inteligente de peso objetivo según IMC (-5 kg sobrepeso, 0 kg ideal, +5 kg bajo peso)
  const suggestedInfo = useMemo(() => {
    const w = parseFloat(initialWeight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return getSuggestedTargetWeight(w, h);
    }
    return null;
  }, [initialWeight, height]);

  // Actualizar automáticamente el peso objetivo si el usuario no lo ha sobreescrito manualmente
  useEffect(() => {
    if (suggestedInfo && !hasManualTargetEdited) {
      setTargetWeight(suggestedInfo.targetWeight.toString());
    }
  }, [suggestedInfo, hasManualTargetEdited]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre.');
      return;
    }
    if (!birthDate) {
      setErrorMessage('Por favor ingresa tu fecha de nacimiento.');
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 260) {
      setErrorMessage('Por favor ingresa una estatura válida en centímetros (ej: 175).');
      return;
    }

    const weightNum = parseFloat(initialWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMessage('Por favor ingresa tu peso inicial válido en kilogramos.');
      return;
    }

    const targetWeightNum = targetWeight ? parseFloat(targetWeight) : undefined;
    const finalTargetWeight =
      targetWeightNum !== undefined && !isNaN(targetWeightNum) && targetWeightNum > 0
        ? targetWeightNum
        : suggestedInfo?.targetWeight;

    const newProfile: UserProfile = {
      name: name.trim(),
      birthDate,
      gender,
      height: heightNum,
      initialWeight: weightNum,
      targetWeight: finalTargetWeight,
      preferredWeightUnit: 'kg',
      weekStartDay,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProfile(newProfile);
    setErrorMessage('');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>¡Bienvenido a fitGo!</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <IonIcon icon={personCircleOutline} style={{ fontSize: '72px', color: 'var(--ion-color-primary)' }} />
          <h2 style={{ fontWeight: 700, margin: '8px 0 4px' }}>Configuración Inicial</h2>
          <IonText color="medium">
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Para calcular tu IMC y personalizar tus entrenamientos, necesitamos conocerte un poco.
            </p>
          </IonText>
        </div>

        {errorMessage && (
          <IonCard color="danger" style={{ margin: '0 0 16px' }}>
            <IonCardContent style={{ padding: '12px' }}>
              <strong>Atención:</strong> {errorMessage}
              <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Día de inicio de semana
              </IonLabel>
              <IonSelect
                value={weekStartDay}
                interface="popover"
                onIonChange={(e) => setWeekStartDay(Number(e.detail.value))}
              >
                <IonSelectOption value={1}>Lunes (Recomendado)</IonSelectOption>
                <IonSelectOption value={0}>Domingo</IonSelectOption>
                <IonSelectOption value={2}>Martes</IonSelectOption>
                <IonSelectOption value={3}>Miércoles</IonSelectOption>
                <IonSelectOption value={4}>Jueves</IonSelectOption>
                <IonSelectOption value={5}>Viernes</IonSelectOption>
                <IonSelectOption value={6}>Sábado</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
          </IonCard>
        )}

        <IonCard style={{ margin: '0 0 20px', borderRadius: '16px' }}>
          <IonCardContent style={{ padding: '8px 16px' }}>
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Nombre completo *
              </IonLabel>
              <IonInput
                value={name}
                placeholder="Ej. Carlos Martínez"
                onIonInput={(e) => setName(e.detail.value || '')}
              />
            </IonItem>

            <DateInput
              label="Fecha de nacimiento"
              value={birthDate}
              onChange={setBirthDate}
              required
            />

            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Género *
              </IonLabel>
              <IonSelect
                value={gender}
                interface="popover"
                onIonChange={(e) => setGender(e.detail.value)}
              >
                <IonSelectOption value="male">Masculino</IonSelectOption>
                <IonSelectOption value="female">Femenino</IonSelectOption>
                <IonSelectOption value="other">Otro</IonSelectOption>
                <IonSelectOption value="prefer_not_to_say">Prefiero no especificar</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Estatura (cm) *
              </IonLabel>
              <IonInput
                type="number"
                placeholder="Ej. 175"
                value={height}
                onIonInput={(e) => setHeight(e.detail.value || '')}
              />
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Peso inicial (kg) *
              </IonLabel>
              <IonInput
                type="number"
                step="0.1"
                placeholder="Ej. 72.5"
                value={initialWeight}
                onIonInput={(e) => setInitialWeight(e.detail.value || '')}
              />
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Peso objetivo (kg)
              </IonLabel>
              <IonInput
                type="number"
                step="0.1"
                placeholder="Ej. 68.0"
                value={targetWeight}
                onIonInput={(e) => {
                  setHasManualTargetEdited(true);
                  setTargetWeight(e.detail.value || '');
                }}
              />
            </IonItem>

            {/* Banner explicativo del cálculo automático del peso objetivo */}
            {suggestedInfo && (
              <div
                style={{
                  margin: '8px 0 12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--ion-color-step-50, rgba(255, 255, 255, 0.05))',
                  borderRadius: '12px',
                  border: '1px solid var(--ion-color-step-150, rgba(255, 255, 255, 0.1))',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <IonBadge
                    color={
                      suggestedInfo.diffKg < 0 ? 'warning' : suggestedInfo.diffKg > 0 ? 'tertiary' : 'success'
                    }
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    {suggestedInfo.diffKg < 0
                      ? '-5 kg (Sobrepeso)'
                      : suggestedInfo.diffKg > 0
                      ? '+5 kg (Bajo peso)'
                      : '0 kg (Peso ideal)'}
                  </IonBadge>

                  {hasManualTargetEdited && (
                    <IonButton
                      fill="clear"
                      size="small"
                      color="secondary"
                      style={{ height: '24px', fontSize: '0.75rem', textTransform: 'none' }}
                      onClick={() => {
                        setHasManualTargetEdited(false);
                        setTargetWeight(suggestedInfo.targetWeight.toString());
                      }}
                    >
                      <IonIcon slot="start" icon={refreshOutline} />
                      Usar recomendación
                    </IonButton>
                  )}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--ion-color-medium)', lineHeight: 1.35 }}>
                  {suggestedInfo.reason}
                </p>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        <div style={{ padding: '0 8px 24px' }}>
          <IonButton
            expand="block"
            size="large"
            style={{ borderRadius: '12px', fontWeight: 600 }}
            onClick={handleSubmit}
          >
            <IonIcon slot="start" icon={checkmarkCircleOutline} />
            Comenzar mi transformación
          </IonButton>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <IonText color="medium">
              <small>
                <IonIcon icon={sparklesOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Tus datos se guardan de forma 100% segura y privada en este dispositivo.
              </small>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
