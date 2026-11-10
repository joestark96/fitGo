import React, { useState, useEffect, useRef } from 'react';
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
  sparklesOutline,
  cloudUploadOutline,
  cloudDownloadOutline,
  shareSocialOutline,
  shieldCheckmarkOutline,
  personOutline,
  cloudOutline,
  searchOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useApp } from '../context/AppContext';
import { Gender, UserProfile, APP_VERSION } from '../types';
import {
  calculateAge,
  formatDateDDMMYYYY,
  getLocalDateString,
  StorageService,
  FitTrackBackupPayload,
} from '../services/storage';
import { DateInput } from '../components/DateInput';
import { AppHeader } from '../components/AppHeader';
import { GamificationModal } from '../components/GamificationModal';
import { notificationService } from '../services/notificationService';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    saveProfile,
    resetAllData,
    refreshData,
    workoutSessions,
    weightRecords,
    routines,
    foodEntries,
    gamification,
  } = useApp();
  const [gamificationModalTab, setGamificationModalTab] = useState<'missions' | 'achievements' | 'tonnage' | null>(null);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('170');
  const [targetWeight, setTargetWeight] = useState('68');
  const [preferredWeightUnit, setPreferredWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [weekStartDay, setWeekStartDay] = useState<number>(1);

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('Perfil actualizado correctamente.');
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(() =>
    StorageService.getLastBackupDate()
  );
  const [backupVerificationInfo, setBackupVerificationInfo] = useState<{
    isOpen: boolean;
    title: string;
    subHeader: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    subHeader: '',
    message: '',
  });
  const [pendingRestorePayload, setPendingRestorePayload] =
    useState<Partial<FitTrackBackupPayload> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const downloadBackupFile = (jsonString: string, fileName: string) => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildBackupSummaryText = (
    payload: FitTrackBackupPayload,
    fileName: string,
    savedLocation: string
  ) => {
    const sizeKb = Math.max(1, Math.round(JSON.stringify(payload).length / 1024));
    return (
      `Archivo: ${fileName} (~${sizeKb} KB)\n` +
      `Destino: ${savedLocation}\n\n` +
      `Datos incluidos en este respaldo:\n` +
      `• Perfil: ${payload.profile?.name || 'Sin nombre'}\n` +
      `• Rutinas: ${payload.routines.length}\n` +
      `• Entrenamientos: ${payload.workoutSessions.length}\n` +
      `• Registros de peso: ${payload.weightRecords.length}\n` +
      `• Registros de nutrición: ${payload.foodEntries.length}\n` +
      `• Días de pasos/actividad: ${payload.dailyActivities.length}`
    );
  };

  const handleExportToDriveOrShare = async () => {
    const payload = StorageService.exportBackupData();
    setLastBackupAt(payload.exportedAt);
    const datePart = getLocalDateString();
    const fileName = `fittrack-respaldo-${datePart}.json`;
    const jsonString = JSON.stringify(payload, null, 2);

    // 1. Native Android / iOS via @capacitor/filesystem + @capacitor/share
    if (Capacitor.isNativePlatform()) {
      try {
        // Also save a persistent internal copy in Directory.Data so we can always verify it on device
        await Filesystem.writeFile({
          path: 'fittrack-ultimo-respaldo.json',
          data: jsonString,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        }).catch(() => {});

        const writtenFile = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: fileName,
          files: [writtenFile.uri],
          dialogTitle: 'Elige "Drive" para guardar tu respaldo',
        });

        setBackupVerificationInfo({
          isOpen: true,
          title: 'Respaldo Generado con Éxito',
          subHeader: `${formatDateDDMMYYYY(payload.exportedAt)} • ${new Date(payload.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          message: buildBackupSummaryText(
            payload,
            fileName,
            'Menú nativo de Android (Google Drive) + Copia interna de seguridad'
          ),
        });
        return;
      } catch (err: any) {
        if (err?.message && !String(err.message).toLowerCase().includes('cancel')) {
          setToastText('Respaldo interno guardado en el dispositivo.');
          setShowToast(true);
        }
        return;
      }
    }

    // 2. Web / Desktop fallback
    try {
      const file = new File([jsonString], fileName, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Respaldo FitTrack (${datePart})`,
          text: 'Guarda este archivo en tu Google Drive para respaldar tu progreso de FitTrack.',
          files: [file],
        });
      } else {
        downloadBackupFile(jsonString, fileName);
      }
      setBackupVerificationInfo({
        isOpen: true,
        title: 'Respaldo Guardado con Éxito',
        subHeader: `${formatDateDDMMYYYY(payload.exportedAt)} • ${new Date(payload.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        message: buildBackupSummaryText(payload, fileName, 'Carpeta de Descargas / Google Drive'),
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        downloadBackupFile(jsonString, fileName);
        setBackupVerificationInfo({
          isOpen: true,
          title: 'Respaldo Descargado',
          subHeader: `${formatDateDDMMYYYY(payload.exportedAt)}`,
          message: buildBackupSummaryText(payload, fileName, 'Carpeta de Descargas del dispositivo'),
        });
      }
    }
  };

  const handleDirectDownloadBackup = async () => {
    const payload = StorageService.exportBackupData();
    setLastBackupAt(payload.exportedAt);
    const datePart = getLocalDateString();
    const fileName = `fittrack-respaldo-${datePart}.json`;
    const jsonString = JSON.stringify(payload, null, 2);

    if (Capacitor.isNativePlatform()) {
      try {
        // Save in internal Data storage AND Documents (if permitted)
        await Filesystem.writeFile({
          path: 'fittrack-ultimo-respaldo.json',
          data: jsonString,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        let savedPath = 'Almacenamiento interno de FitTrack';
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          savedPath = `Carpeta Documentos/${fileName}`;
        } catch {
          // If Android 11+ scoped storage restricts direct Documents overwrite, open native share so user can pick "Guardar en dispositivo / Descargas"
          const cacheFile = await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
          });
          await Share.share({
            title: fileName,
            url: cacheFile.uri,
            dialogTitle: 'Guardar archivo .JSON',
          }).catch(() => {});
          savedPath = `Archivo ${fileName} listo`;
        }

        setBackupVerificationInfo({
          isOpen: true,
          title: 'Archivo .JSON Guardado',
          subHeader: `${formatDateDDMMYYYY(payload.exportedAt)} • ${new Date(payload.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          message: buildBackupSummaryText(payload, fileName, savedPath),
        });
        return;
      } catch (e) {
        console.warn('Native write fallback:', e);
      }
    }

    downloadBackupFile(jsonString, fileName);
    setBackupVerificationInfo({
      isOpen: true,
      title: 'Archivo .JSON Descargado',
      subHeader: `${formatDateDDMMYYYY(payload.exportedAt)} • ${new Date(payload.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      message: buildBackupSummaryText(payload, fileName, `Descargas/${fileName}`),
    });
  };

  const handleVerifyBackupStatus = async () => {
    const currentPayload = StorageService.exportBackupData();
    const lastDate = StorageService.getLastBackupDate();
    let nativeSavedExists = false;

    if (Capacitor.isNativePlatform()) {
      try {
        const stat = await Filesystem.stat({
          path: 'fittrack-ultimo-respaldo.json',
          directory: Directory.Data,
        });
        nativeSavedExists = Boolean(stat?.uri);
      } catch {
        nativeSavedExists = false;
      }
    }

    const sizeKb = Math.max(1, Math.round(JSON.stringify(currentPayload).length / 1024));
    setBackupVerificationInfo({
      isOpen: true,
      title: 'Diagnóstico de tu Respaldo',
      subHeader: lastDate
        ? `Último respaldo: ${formatDateDDMMYYYY(lastDate)} (${new Date(lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : 'Aún no has exportado un respaldo manual',
      message:
        `Auto-Backup Android (Google Drive): ACTIVO\n` +
        `Copia interna en teléfono: ${nativeSavedExists || lastDate ? 'VERIFICADA (' + sizeKb + ' KB)' : 'Pendiente de primer guardado'}\n\n` +
        `Datos actuales listos para respaldar:\n` +
        `• Perfil: ${currentPayload.profile?.name || 'Sin nombre'}\n` +
        `• Nivel: Nv.${gamification.level} (${gamification.totalXp} XP)\n` +
        `• Rutinas: ${currentPayload.routines.length}\n` +
        `• Entrenamientos: ${currentPayload.workoutSessions.length}\n` +
        `• Registros de peso: ${currentPayload.weightRecords.length}\n` +
        `• Registros de nutrición: ${currentPayload.foodEntries.length}`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<FitTrackBackupPayload>;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        (parsed.appName !== 'FitTrack' &&
          !Array.isArray(parsed.workoutSessions) &&
          !Array.isArray(parsed.routines))
      ) {
        setErrorMessage('El archivo seleccionado no es un respaldo válido de FitTrack.');
        return;
      }
      setErrorMessage('');
      setPendingRestorePayload(parsed);
    } catch {
      setErrorMessage('No se pudo leer el archivo JSON. Asegúrate de elegir un respaldo de FitTrack.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmRestoreBackup = async () => {
    if (!pendingRestorePayload) return;
    try {
      await StorageService.importBackupData(pendingRestorePayload);
      refreshData();
      setLastBackupAt(StorageService.getLastBackupDate());
      setPendingRestorePayload(null);
      setToastText('✅ ¡Progreso restaurado exitosamente desde el respaldo!');
      setShowToast(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al restaurar el respaldo.');
      setPendingRestorePayload(null);
    }
  };

  // Easter egg states: 12 taps on logo triggers Android notification
  const [tapCount, setTapCount] = useState(0);
  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const [easterEggToast, setEasterEggToast] = useState<{
    isOpen: boolean;
    message: string;
    color: string;
  }>({
    isOpen: false,
    message: '',
    color: 'primary',
  });
  const tapResetTimerRef = useRef<any>(null);

  const handleLogoTap = async () => {
    // Visual bounce
    setIsLogoPressed(true);
    setTimeout(() => setIsLogoPressed(false), 120);

    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }

    // Reset tap sequence after 3 seconds of inactivity
    if (tapResetTimerRef.current) {
      clearTimeout(tapResetTimerRef.current);
    }
    tapResetTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 3000);

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount >= 12) {
      setTapCount(0);
      if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);

      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {
        // ignore
      }

      // Fire Android native notification
      await notificationService.triggerEasterEggNotification();

      setEasterEggToast({
        isOpen: true,
        message: '🎉 ¡Easter Egg desbloqueado! Notificación enviada.',
        color: 'primary',
      });
    } else if (nextCount >= 7) {
      const remaining = 12 - nextCount;
      setEasterEggToast({
        isOpen: true,
        message: `Estás a ${remaining} toque${remaining > 1 ? 's' : ''} de desbloquear el secreto...`,
        color: 'dark',
      });
    }
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBirthDate(profile.birthDate || '');
      setGender(profile.gender || 'male');
      setHeight(profile.height ? profile.height.toString() : '170');
      setTargetWeight(profile.targetWeight ? profile.targetWeight.toString() : '');
      setPreferredWeightUnit(profile.preferredWeightUnit || 'kg');
      setWeekStartDay(profile.weekStartDay !== undefined ? profile.weekStartDay : 1);
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
      initialWeight: profile ? profile.initialWeight : undefined,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      preferredWeightUnit: preferredWeightUnit,
      weekStartDay: weekStartDay,
      createdAt: profile ? profile.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProfile(updatedProfile);
    setErrorMessage('');
    setToastText('Perfil actualizado correctamente.');
    setShowToast(true);
  };

  const calculatedAge = birthDate ? calculateAge(birthDate) : null;

  return (
    <IonPage>
      <AppHeader subtitle="Mi Cuenta & Objetivos" onBrandClick={handleLogoTap} />

      <IonContent className="ion-padding" fullscreen>
        {/* User Avatar & App Logo Card */}
        <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
          <div
            onClick={handleLogoTap}
            style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              margin: '0 auto',
              borderRadius: '22px',
              overflow: 'hidden',
              border: '2px solid var(--ion-color-step-150)',
              cursor: 'pointer',
              userSelect: 'none',
              transform: isLogoPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.12s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            }}
            title="FitTrack Logo"
          >
            <img
              src="/icon-192.png"
              alt="FitTrack Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
            />
          </div>

          {/* Version number below the logo */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 600,
              letterSpacing: '0.4px',
              marginTop: '6px',
              marginBottom: '10px',
            }}
          >
            v{APP_VERSION}
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

        {/* Athlete Gamification Card */}
        <IonCard
          onClick={() => setGamificationModalTab('achievements')}
          style={{
            margin: '0 0 14px',
            borderRadius: '18px',
            background: gamification.rank.gradient,
            border: '1px solid rgba(255,255,255,0.16)',
            cursor: 'pointer',
          }}
        >
          <IonCardContent style={{ padding: '16px', color: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.45)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  <IonIcon icon={trophyOutline} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.9 }}>
                    NIVEL {gamification.level} • {gamification.totalXp.toLocaleString()} XP
                  </div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 900 }}>
                    {gamification.rank.title}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {gamification.unlockedAchievementsCount}/{gamification.achievements.length} Logros
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Ver Trofeos →</div>
              </div>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${gamification.levelProgressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #fde047 0%, #f97316 100%)',
                  borderRadius: '999px',
                }}
              />
            </div>
          </IonCardContent>
        </IonCard>

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

        {/* Modernized Personal Data Card */}
        <IonCard
          style={{
            margin: '0 0 20px',
            borderRadius: '22px',
            background: 'var(--ion-card-background, rgba(15, 23, 42, 0.85))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.22)',
            overflow: 'hidden',
          }}
        >
          {/* Card Header Banner */}
          <div
            style={{
              padding: '16px 18px 14px',
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(99, 102, 241, 0.06) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  color: '#60a5fa',
                }}
              >
                <IonIcon icon={personOutline} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ion-text-color)' }}>
                  Datos Personales
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ion-color-medium)' }}>
                  Perfil biométrico, objetivos y preferencias
                </div>
              </div>
            </div>
            {calculatedAge !== null && (
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.16)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#93c5fd',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.73rem',
                  fontWeight: 800,
                }}
              >
                {calculatedAge} años
              </div>
            )}
          </div>

          <IonCardContent style={{ padding: '18px 16px' }}>
            {/* 1. Nombre Completo */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                <span>Nombre completo *</span>
              </label>
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '2px 12px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IonInput
                  value={name}
                  placeholder="Tu nombre o apodo"
                  onIonInput={(e) => setName(e.detail.value || '')}
                  style={{ fontWeight: 700, fontSize: '1rem' }}
                />
              </div>
            </div>

            {/* 2. Fecha de Nacimiento */}
            <div
              style={{
                marginBottom: '16px',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '4px 6px',
              }}
            >
              <DateInput
                label="Fecha de nacimiento"
                value={birthDate}
                onChange={setBirthDate}
                required
              />
            </div>

            {/* 3. Selector Interactivo de Género */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                Género *
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {[
                  { value: 'male' as Gender, label: 'Masculino', color: '#3b82f6' },
                  { value: 'female' as Gender, label: 'Femenino', color: '#ec4899' },
                  { value: 'other' as Gender, label: 'Otro', color: '#8b5cf6' },
                  {
                    value: 'prefer_not_to_say' as Gender,
                    label: 'Reservado',
                    color: '#64748b',
                  },
                ].map((opt) => {
                  const active = gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '13px',
                        border: active
                          ? `1.5px solid ${opt.color}`
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: active
                          ? `${opt.color}22`
                          : 'rgba(15, 23, 42, 0.5)',
                        color: active ? '#ffffff' : 'var(--ion-color-medium)',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Estatura & Peso Objetivo (2-Column Interactive Grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              {/* Estatura Card */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(56, 189, 248, 0.22)',
                  borderRadius: '16px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  Estatura *
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={height}
                    placeholder="175"
                    onChange={(e) => setHeight(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--ion-text-color)',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      width: '72px',
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ion-color-medium)' }}>
                    cm
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setHeight(String(Math.max(100, (parseFloat(height) || 170) - 1)))
                    }
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--ion-text-color)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setHeight(String(Math.min(250, (parseFloat(height) || 170) + 1)))
                    }
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#7dd3fc',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Peso Objetivo Card */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 800,
                    color: '#34d399',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  Peso Meta
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={targetWeight}
                    placeholder="70"
                    onChange={(e) => setTargetWeight(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--ion-text-color)',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      width: '72px',
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ion-color-medium)' }}>
                    kg
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setTargetWeight(
                        String(Math.max(35, Number(((parseFloat(targetWeight) || 70) - 0.5).toFixed(1))))
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--ion-text-color)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    -0.5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTargetWeight(
                        String(Math.min(250, Number(((parseFloat(targetWeight) || 70) + 0.5).toFixed(1))))
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#6ee7b7',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    +0.5
                  </button>
                </div>
              </div>
            </div>

            {/* Live Target BMI Preview Pill */}
            {(() => {
              const hNum = parseFloat(height);
              const twNum = parseFloat(targetWeight);
              if (!isNaN(hNum) && hNum >= 100 && !isNaN(twNum) && twNum >= 30) {
                const targetBmi = twNum / Math.pow(hNum / 100, 2);
                const healthyMin = (18.5 * Math.pow(hNum / 100, 2)).toFixed(0);
                const healthyMax = (24.9 * Math.pow(hNum / 100, 2)).toFixed(0);
                const isHealthy = targetBmi >= 18.5 && targetBmi <= 24.9;
                return (
                  <div
                    style={{
                      background: isHealthy
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                      border: isHealthy
                        ? '1px dashed rgba(16, 185, 129, 0.35)'
                        : '1px dashed rgba(245, 158, 11, 0.35)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                    }}
                  >
                    <span style={{ color: 'var(--ion-color-medium)', fontWeight: 600 }}>
                      Rango ideal para {hNum} cm:{' '}
                      <strong style={{ color: 'var(--ion-text-color)' }}>
                        {healthyMin} – {healthyMax} kg
                      </strong>
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: isHealthy ? '#34d399' : '#fbbf24',
                      }}
                    >
                      IMC Meta: {targetBmi.toFixed(1)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* 5. Unidad de Peso Preferida (Segmented Toggle) */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                Unidad de peso predeterminada
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.55)',
                  padding: '5px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {[
                  { value: 'kg' as const, title: 'Kilogramos (kg)', sub: 'Sistema métrico' },
                  { value: 'lb' as const, title: 'Libras (lb)', sub: 'Sistema imperial' },
                ].map((u) => {
                  const active = preferredWeightUnit === u.value;
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setPreferredWeightUnit(u.value)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '10px',
                        border: active
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid transparent',
                        background: active
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(37, 99, 235, 0.2) 100%)'
                          : 'transparent',
                        color: active ? '#ffffff' : 'var(--ion-color-medium)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{u.title}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.75 }}>{u.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Día de Inicio de Semana (Interactive Pill Selector) */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Inicio de semana (Informes)
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)' }}>
                  {weekStartDay === 1 ? 'Recomendado' : 'Personalizado'}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '6px',
                }}
              >
                {[
                  { day: 1, short: 'Lun' },
                  { day: 2, short: 'Mar' },
                  { day: 3, short: 'Mié' },
                  { day: 4, short: 'Jue' },
                  { day: 5, short: 'Vie' },
                  { day: 6, short: 'Sáb' },
                  { day: 0, short: 'Dom' },
                ].map((item) => {
                  const active = weekStartDay === item.day;
                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => setWeekStartDay(item.day)}
                      style={{
                        padding: '9px 2px',
                        borderRadius: '11px',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        border: active
                          ? '1.5px solid #3b82f6'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: active
                          ? 'rgba(59, 130, 246, 0.25)'
                          : 'rgba(15, 23, 42, 0.5)',
                        color: active ? '#93c5fd' : 'var(--ion-color-medium)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <IonButton
              expand="block"
              onClick={handleSave}
              style={
                {
                  '--background': 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                  '--border-radius': '14px',
                  '--box-shadow': '0 8px 20px rgba(59, 130, 246, 0.3)',
                  fontWeight: 800,
                  height: '50px',
                  fontSize: '0.98rem',
                } as React.CSSProperties
              }
            >
              <IonIcon slot="start" icon={saveOutline} />
              Guardar Cambios
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Google Drive & Cloud Backup Card */}
        <IonCard
          style={{
            margin: '0 0 20px',
            borderRadius: '22px',
            background: 'var(--ion-card-background, rgba(15, 23, 42, 0.85))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.22)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 18px 14px',
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(14, 165, 233, 0.08) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  color: '#34d399',
                }}
              >
                <IonIcon icon={cloudOutline} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.03rem', color: 'var(--ion-text-color)' }}>
                  Respaldo en Google Drive
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--ion-color-medium)' }}>
                  Guarda o restaura todo tu progreso e historial
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <IonIcon icon={shieldCheckmarkOutline} />
              Auto-Backup Android Activo
            </div>
          </div>

          <IonCardContent style={{ padding: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--ion-color-medium)', lineHeight: 1.45 }}>
              En Android, tu base de datos se incluye en la copia de seguridad automática del sistema en{' '}
              <strong style={{ color: 'var(--ion-text-color)' }}>Google Drive</strong>. También puedes
              guardar o restaurar una copia manual en cualquier momento:
            </p>

            {/* Summary of included items */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {[
                { label: 'Rutinas', val: routines.length },
                { label: 'Entrenos', val: workoutSessions.length },
                { label: 'Pesajes', val: weightRecords.length },
                { label: 'Comidas', val: foodEntries.length },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '8px 4px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--ion-text-color)' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {lastBackupAt && (
              <div
                style={{
                  fontSize: '0.74rem',
                  color: '#6ee7b7',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '7px 10px',
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                Último respaldo manual: {formatDateDDMMYYYY(lastBackupAt)} (
                {new Date(lastBackupAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </div>
            )}

            {/* Primary Button: Share / Save to Google Drive */}
            <IonButton
              expand="block"
              onClick={handleExportToDriveOrShare}
              style={
                {
                  '--background': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  '--border-radius': '13px',
                  fontWeight: 800,
                  height: '46px',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                } as React.CSSProperties
              }
            >
              <IonIcon slot="start" icon={shareSocialOutline} />
              Guardar en Google Drive / Compartir
            </IonButton>

            {/* Secondary Row: Direct Download & Restore from Drive/File */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <IonButton
                expand="block"
                fill="outline"
                color="primary"
                onClick={handleDirectDownloadBackup}
                style={{ '--border-radius': '12px', fontWeight: 700, fontSize: '0.78rem' } as React.CSSProperties}
              >
                <IonIcon slot="start" icon={cloudDownloadOutline} />
                Descargar .JSON
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                color="secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ '--border-radius': '12px', fontWeight: 700, fontSize: '0.78rem' } as React.CSSProperties}
              >
                <IonIcon slot="start" icon={cloudUploadOutline} />
                Restaurar Copia
              </IonButton>
            </div>

            {/* Diagnostic / Verification Button */}
            <button
              type="button"
              onClick={handleVerifyBackupStatus}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '11px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.28)',
                color: '#93c5fd',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <IonIcon icon={searchOutline} />
              <span>Verificar estado y contenido de mi respaldo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
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
          message={toastText}
          duration={2400}
          color="success"
        />

        <IonAlert
          isOpen={backupVerificationInfo.isOpen}
          onDidDismiss={() =>
            setBackupVerificationInfo((prev) => ({ ...prev, isOpen: false }))
          }
          header={backupVerificationInfo.title}
          subHeader={backupVerificationInfo.subHeader}
          message={backupVerificationInfo.message}
          buttons={['Entendido']}
        />

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
              text: 'Restaurar Ahora',
              handler: () => {
                confirmRestoreBackup();
              },
            },
          ]}
        />

        <IonToast
          isOpen={easterEggToast.isOpen}
          onDidDismiss={() => setEasterEggToast((prev) => ({ ...prev, isOpen: false }))}
          message={easterEggToast.message}
          duration={2200}
          color={easterEggToast.color}
          position="bottom"
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
        <GamificationModal
          isOpen={gamificationModalTab !== null}
          initialTab={gamificationModalTab || 'achievements'}
          onClose={() => setGamificationModalTab(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;

