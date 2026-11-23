import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IonAlert,
  IonToast,
  IonLoading,
} from '@ionic/react';
import {
  personCircleOutline,
  checkmarkCircleOutline,
  sparklesOutline,
  refreshOutline,
  cloudDownloadOutline,
  documentTextOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useApp } from '../context/AppContext';
import { Gender, UserProfile } from '../types';
import {
  getSuggestedTargetWeight,
  StorageService,
  FitTrackBackupPayload,
  formatDateDDMMYYYY,
} from '../services/storage';
import { DateInput } from './DateInput';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { saveProfile, refreshData } = useApp();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<string>('170');
  const [initialWeight, setInitialWeight] = useState<string>('70');
  const [targetWeight, setTargetWeight] = useState<string>('70');
  const [weekStartDay, setWeekStartDay] = useState<number>(1);
  const [hasManualTargetEdited, setHasManualTargetEdited] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Import / restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [pendingRestorePayload, setPendingRestorePayload] =
    useState<Partial<FitTrackBackupPayload> | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [localNativeBackup, setLocalNativeBackup] = useState<{
    exists: boolean;
    payload: Partial<FitTrackBackupPayload> | null;
  }>({ exists: false, payload: null });

  // Detect local native backup in Android Data folder if available
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      (async () => {
        try {
          let fileName = 'fitgo-ultimo-respaldo.json';
          let stat: any = null;
          try {
            stat = await Filesystem.stat({ path: fileName, directory: Directory.Data });
          } catch {
            fileName = 'fittrack-ultimo-respaldo.json';
            try {
              stat = await Filesystem.stat({ path: fileName, directory: Directory.Data });
            } catch {
              stat = null;
            }
          }

          if (stat?.uri) {
            const content = await Filesystem.readFile({
              path: fileName,
              directory: Directory.Data,
              encoding: Encoding.UTF8,
            });
            if (typeof content.data === 'string') {
              const parsed = JSON.parse(content.data);
              if (
                parsed &&
                (parsed.profile ||
                  (Array.isArray(parsed.workoutSessions) && parsed.workoutSessions.length > 0) ||
                  (Array.isArray(parsed.routines) && parsed.routines.length > 0))
              ) {
                setLocalNativeBackup({
                  exists: true,
                  payload: parsed,
                });
              }
            }
          }
        } catch (e) {
          console.warn('[OnboardingModal] Error checking local native backup:', e);
        }
      })();
    }
  }, []);

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

  // Si no está abierto, no renderizamos absolutamente nada en el DOM
  if (!isOpen) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<FitTrackBackupPayload>;

      const isValid =
        parsed &&
        typeof parsed === 'object' &&
        (parsed.appName === 'fitGo!' ||
          parsed.appName === 'fitGo' ||
          parsed.appName === 'FitTrack' ||
          Boolean(parsed.profile) ||
          Array.isArray(parsed.workoutSessions) ||
          Array.isArray(parsed.routines) ||
          Array.isArray(parsed.weightRecords));

      if (!isValid) {
        setErrorMessage('El archivo seleccionado no es un respaldo válido (.json) de fitGo!.');
        return;
      }

      setErrorMessage('');
      setPendingRestorePayload(parsed);
    } catch {
      setErrorMessage(
        'No se pudo leer el archivo JSON. Verifica que sea un respaldo válido de fitGo!.'
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmRestoreBackup = async () => {
    if (!pendingRestorePayload) return;
    try {
      setIsImporting(true);
      await StorageService.importBackupData(pendingRestorePayload);
      refreshData();

      if (pendingRestorePayload.profile && pendingRestorePayload.profile.name) {
        setPendingRestorePayload(null);
        setToastMessage('¡Datos y perfil restaurados exitosamente! Bienvenido de vuelta a fitGo!.');
        setShowToast(true);
        if (onComplete) {
          onComplete();
        }
      } else {
        setPendingRestorePayload(null);
        setToastMessage('Rutinas y datos importados con éxito. Completa tu perfil para continuar.');
        setShowToast(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al restaurar el respaldo.');
      setPendingRestorePayload(null);
    } finally {
      setIsImporting(false);
    }
  };

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
        <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.2rem' }}>
          <IonIcon icon={personCircleOutline} style={{ fontSize: '68px', color: 'var(--ion-color-primary)' }} />
          <h2 style={{ fontWeight: 800, margin: '6px 0 4px', fontSize: '1.35rem' }}>Configuración Inicial</h2>
          <IonText color="medium">
            <p style={{ margin: 0, fontSize: '0.92rem' }}>
              Comienza tu camino hacia una mejor versión o restaura tus datos previos.
            </p>
          </IonText>
        </div>

        {/* ========================================================= */}
        {/* OPCIÓN: IMPORTAR DATOS EXISTENTES / RESPALDO PREVIO       */}
        {/* ========================================================= */}
        <div
          style={{
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                flexShrink: 0,
              }}
            >
              <IonIcon icon={cloudDownloadOutline} style={{ fontSize: '22px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#f8fafc' }}>
                ¿Ya usabas fitGo o tienes un respaldo?
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.35 }}>
                Restaura todo tu historial de entrenamientos, rutinas, peso y niveles en un toque.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {localNativeBackup.exists && localNativeBackup.payload && (
              <button
                type="button"
                onClick={() => setPendingRestorePayload(localNativeBackup.payload)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  color: '#34d399',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <IonIcon icon={phonePortraitOutline} style={{ fontSize: '18px' }} />
                Restaurar copia encontrada en el teléfono
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.14)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <IonIcon icon={documentTextOutline} style={{ fontSize: '18px' }} />
              {isImporting ? 'Cargando archivo...' : 'Importar copia de seguridad (.json)'}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Separador elegante */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
          <span
            style={{
              fontSize: '0.74rem',
              color: '#64748b',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            O crea tu perfil desde cero
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
        </div>

        {errorMessage && (
          <IonCard color="danger" style={{ margin: '0 0 16px', borderRadius: '12px' }}>
            <IonCardContent style={{ padding: '12px 14px', fontSize: '0.88rem' }}>
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

            <IonItem lines="full">
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

        {/* Diálogo de confirmación de restauración */}
        <IonAlert
          isOpen={Boolean(pendingRestorePayload)}
          onDidDismiss={() => setPendingRestorePayload(null)}
          header="¿Restaurar Respaldo?"
          subHeader={
            pendingRestorePayload?.exportedAt
              ? `Exportado el ${formatDateDDMMYYYY(pendingRestorePayload.exportedAt)}`
              : undefined
          }
          message={`Se restaurará el perfil de "${pendingRestorePayload?.profile?.name || 'Usuario'}" con ${pendingRestorePayload?.routines?.length || 0} rutinas, ${pendingRestorePayload?.workoutSessions?.length || 0} entrenamientos y ${pendingRestorePayload?.weightRecords?.length || 0} registros de peso.`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Restaurar e Iniciar',
              handler: () => {
                confirmRestoreBackup();
              },
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="success"
        />

        <IonLoading isOpen={isImporting} message="Restaurando información..." />
      </IonContent>
    </IonModal>
  );
};
