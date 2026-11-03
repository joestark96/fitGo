import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAlert,
  IonToast,
  IonText,
  IonAvatar,
} from '@ionic/react';
import {
  personCircleOutline,
  saveOutline,
  refreshOutline,
  trashOutline,
  trophyOutline,
  scaleOutline,
  barbellOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { Gender, UserProfile } from '../types';
import { calculateAge, formatDateDDMMYYYY } from '../services/storage';
import { DateInput } from '../components/DateInput';
import { AppHeader } from '../components/AppHeader';

export const ProfilePage: React.FC = () => {
  const { profile, saveProfile, resetAllData, workoutSessions, weightRecords } = useApp();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('170');
  const [targetWeight, setTargetWeight] = useState('68');

  const [showToast, setShowToast] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBirthDate(profile.birthDate || '');
      setGender(profile.gender || 'male');
      setHeight(profile.height ? profile.height.toString() : '170');
      setTargetWeight(profile.targetWeight ? profile.targetWeight.toString() : '');
    }
  }, [profile]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Ingresa tu nombre.');
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 260) {
      setErrorMessage('Ingresa una estatura válida en cm.');
      return;
    }

    const updatedProfile: UserProfile = {
      name: name.trim(),
      birthDate,
      gender,
      height: heightNum,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      createdAt: profile ? profile.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProfile(updatedProfile);
    setErrorMessage('');
    setShowToast(true);
  };

  const calculatedAge = birthDate ? calculateAge(birthDate) : null;

  return (
    <IonPage>
      <AppHeader subtitle="Mi Cuenta & Objetivos" />

      <IonContent className="ion-padding" fullscreen>
        {/* User Avatar Card */}
        <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              margin: '0 auto 12px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '2px solid var(--ion-color-step-150)',
            }}
          >
            <img
              src="/icon-192.png"
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h2 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.3px' }}>
            {profile?.name || 'Usuario'}
          </h2>
          <IonText color="medium">
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : 'Otro'}
              {calculatedAge !== null ? ` • ${calculatedAge} años` : ''}
              {birthDate ? ` (${formatDateDDMMYYYY(birthDate)})` : ''} • {height} cm
            </p>
          </IonText>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div className="stat-box">
            <div className="stat-value">{workoutSessions.length}</div>
            <div className="stat-title">Sesiones</div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{weightRecords.length}</div>
            <div className="stat-title">Registros de Peso</div>
          </div>
        </div>

        {errorMessage && (
          <IonCard color="danger" style={{ marginBottom: '16px', borderRadius: '16px' }}>
            <IonCardContent style={{ padding: '10px 14px' }}>{errorMessage}</IonCardContent>
          </IonCard>
        )}

        {/* Form Card */}
        <IonCard style={{ margin: '0 0 20px', borderRadius: '16px' }}>
          <IonCardHeader style={{ padding: '16px 16px 8px' }}>
            <IonCardTitle style={{ fontSize: '1.1rem' }}>Datos Personales</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0 16px 16px' }}>
            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Nombre completo *
              </IonLabel>
              <IonInput
                value={name}
                placeholder="Nombre"
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
                <IonSelectOption value="prefer_not_to_say">Prefiero no decir</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                Estatura (cm) *
              </IonLabel>
              <IonInput
                type="number"
                placeholder="175"
                value={height}
                onIonInput={(e) => setHeight(e.detail.value || '')}
              />
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontWeight: 600 }}>
                🎯 Peso Objetivo (kg)
              </IonLabel>
              <IonInput
                type="number"
                step="0.1"
                placeholder="68.0"
                value={targetWeight}
                onIonInput={(e) => setTargetWeight(e.detail.value || '')}
              />
              <IonText color="medium" style={{ fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
                Meta de peso para el cálculo de progreso e IMC
              </IonText>
            </IonItem>

            <div style={{ marginTop: '18px' }}>
              <IonButton expand="block" style={{ fontWeight: 700 }} onClick={handleSave}>
                <IonIcon slot="start" icon={saveOutline} />
                Guardar Cambios
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Database Management */}
        <IonCard style={{ margin: '0 0 24px', borderRadius: '16px' }}>
          <IonCardHeader style={{ padding: '16px 16px 8px' }}>
            <IonCardTitle style={{ fontSize: '1.05rem', color: 'var(--ion-color-danger)' }}>
              Gestión de Datos Locales
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0 16px 16px' }}>
            <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: 'var(--ion-color-medium)' }}>
              Todos tus datos de rutinas, historial de peso y entrenamientos residen únicamente en
              el almacenamiento local de tu navegador/dispositivo.
            </p>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={() => setShowResetAlert(true)}
            >
              <IonIcon slot="start" icon={trashOutline} />
              Restablecer todos los datos
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Perfil actualizado correctamente."
          duration={2000}
          color="success"
        />

        <IonAlert
          isOpen={showResetAlert}
          onDidDismiss={() => setShowResetAlert(false)}
          header="¿Restablecer datos?"
          message="Se borrarán todos tus datos locales, rutinas personalizadas e historial. La aplicación volverá a solicitar la configuración inicial."
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Borrar todo',
              role: 'destructive',
              handler: () => resetAllData(),
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;

