import React, { useState } from 'react';
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
} from '@ionic/react';
import { personCircleOutline, checkmarkCircleOutline, sparklesOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { Gender, UserProfile } from '../types';
import { formatDateDDMMYYYY } from '../services/storage';
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
  const [targetWeight, setTargetWeight] = useState<string>('68');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    const targetWeightNum = targetWeight ? parseFloat(targetWeight) : undefined;

    const newProfile: UserProfile = {
      name: name.trim(),
      birthDate,
      gender,
      height: heightNum,
      targetWeight: !isNaN(weightNum) && weightNum > 0 ? weightNum : targetWeightNum,
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
          <IonTitle>¡Bienvenido a FitTrack!</IonTitle>
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
                Peso objetivo (kg) (opcional)
              </IonLabel>
              <IonInput
                type="number"
                step="0.1"
                placeholder="Ej. 68.0"
                value={targetWeight}
                onIonInput={(e) => setTargetWeight(e.detail.value || '')}
              />
            </IonItem>
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

