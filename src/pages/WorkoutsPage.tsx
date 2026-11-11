import React, { useState, useRef } from 'react';
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
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonActionSheet,
  IonAlert,
  IonText,
  IonChip,
  IonToast,
} from '@ionic/react';
import {
  addOutline,
  playOutline,
  barbellOutline,
  createOutline,
  trashOutline,
  calendarOutline,
  trophyOutline,
  timeOutline,
  checkmarkDoneOutline,
  searchOutline,
  downloadOutline,
  cloudUploadOutline,
  codeSlashOutline,
  flameOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useApp } from '../context/AppContext';
import { Routine, WorkoutSession } from '../types';
import { formatDateDDMMYYYY, StorageService } from '../services/storage';
import { RoutineFormModal } from '../components/RoutineFormModal';
import { WorkoutPlayerModal } from '../components/WorkoutPlayerModal';
import { ExerciseCatalogModal } from '../components/ExerciseCatalogModal';
import { RoutinesJsonModal } from '../components/RoutinesJsonModal';
import { AppHeader } from '../components/AppHeader';
import { GamificationModal } from '../components/GamificationModal';

export const WorkoutsPage: React.FC = () => {
  const {
    routines,
    deleteRoutine,
    startWorkout,
    activeWorkout,
    workoutSessions,
    profile,
    gamification,
    refreshData,
  } = useApp();

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const quickJsonInputRef = useRef<HTMLInputElement | null>(null);

  const handleQuickDownloadTemplate = async () => {
    const template = StorageService.getRoutinesJsonTemplate();
    const jsonStr = JSON.stringify(template, null, 2);
    const fileName = 'fitgo-formato-rutinas.json';

    if (Capacitor.isNativePlatform()) {
      try {
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: jsonStr,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
        } catch {
          // ignore
        }
        const cacheFile = await Filesystem.writeFile({
          path: fileName,
          data: jsonStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: fileName,
          files: [cacheFile.uri],
          dialogTitle: 'Guardar Formato JSON de Rutinas',
        });
        setToastMessage(`Formato ${fileName} listo.`);
        return;
      } catch (err: any) {
        if (err?.message && String(err.message).toLowerCase().includes('cancel')) {
          return;
        }
      }
    }

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(`Formato ${fileName} descargado.`);
  };

  const handleQuickUploadJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await StorageService.importRoutinesAndExercises(parsed, 'merge');
      refreshData();
      setToastMessage(
        `Importadas ${res.importedRoutines} rutina(s) y ${res.importedExercises} ejercicio(s).`
      );
    } catch (err: any) {
      setToastMessage(err?.message || 'Error al importar el archivo JSON.');
    } finally {
      if (quickJsonInputRef.current) {
        quickJsonInputRef.current.value = '';
      }
    }
  };

  const handleCreateNew = () => {
    setRoutineToEdit(null);
    setIsRoutineModalOpen(true);
  };

  const handleEditRoutine = (routine: Routine) => {
    setRoutineToEdit(routine);
    setIsRoutineModalOpen(true);
  };

  const handleStartWorkout = (routine: Routine) => {
    startWorkout(routine);
    setIsPlayerOpen(true);
  };

  const handleResumeWorkout = () => {
    setIsPlayerOpen(true);
  };

  return (
    <IonPage>
      <AppHeader
        subtitle="Rutinas & Gimnasio"
        rightAction={
          <IonButton
            fill="clear"
            size="small"
            onClick={() => setIsCatalogOpen(true)}
            style={{
              background: 'rgba(14, 165, 233, 0.12)',
              borderRadius: '12px',
              fontWeight: 700,
              color: 'var(--ion-color-primary)',
            }}
          >
            <IonIcon slot="start" icon={searchOutline} />
            Catálogo
          </IonButton>
        }
      />

      <IonContent className="ion-padding" fullscreen>
        {/* Active workout banner if one is running in background */}
        {activeWorkout && (
          <IonCard
            className="active-workout-banner"
            style={{
              margin: '0 0 18px',
              borderRadius: '20px',
              color: '#ffffff',
            }}
          >
            <IonCardContent style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      fontWeight: 800,
                      opacity: 0.9,
                      color: '#a7f3d0',
                    }}
                  >
                    ● SESIÓN EN CURSO
                  </div>
                  <strong style={{ fontSize: '1.25rem', letterSpacing: '-0.3px' }}>
                    {activeWorkout.routineName}
                  </strong>
                </div>
                <IonButton
                  fill="solid"
                  color="light"
                  style={{ fontWeight: 800, borderRadius: '12px' }}
                  onClick={handleResumeWorkout}
                >
                  <IonIcon slot="start" icon={playOutline} />
                  Continuar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Welcome Section */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.4px' }}>
            {profile?.name ? `Hola, ${profile.name.split(' ')[0]}` : 'Entrenamientos'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ion-color-medium)' }}>
            Selecciona una rutina para iniciar tu sesión o crea una personalizada.
          </p>
        </div>

        {/* Gamification: Daily Missions & Level Banner */}
        <IonCard
          onClick={() => setIsGamificationOpen(true)}
          style={{
            margin: '0 0 20px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #162032 0%, #121722 100%)',
            border: '1px solid rgba(59, 130, 246, 0.32)',
            cursor: 'pointer',
          }}
        >
          <IonCardContent style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.18)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: '#60a5fa',
                  }}
                >
                  <IonIcon icon={trophyOutline} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    NIVEL {gamification.level} • {gamification.rank.title}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    Misiones de Hoy ({gamification.completedDailyMissionsCount}/3)
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <IonIcon icon={flameOutline} />
                  <span>{gamification.activeStreakDays}d racha</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <IonIcon icon={shieldCheckmarkOutline} />
                  <span>{gamification.shieldsAvailable}/3 escudos</span>
                </div>
              </div>
            </div>

            {/* Level XP Mini Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: '#0b0f17', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
              <div
                style={{
                  width: `${gamification.levelProgressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #34d399 100%)',
                  borderRadius: '999px',
                }}
              />
            </div>

            {/* 3 Daily Mission Quick Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {gamification.dailyMissions.map((m) => (
                <span
                  key={m.id}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 9px',
                    borderRadius: '8px',
                    background: m.completed ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    color: m.completed ? '#34d399' : '#cbd5e1',
                    border: m.completed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {m.completed && <IonIcon icon={checkmarkCircleOutline} />}
                  <span>{m.title}</span>
                </span>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Section: Mis Rutinas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            Mis Rutinas <span style={{ color: 'var(--ion-color-medium)', fontWeight: 500 }}>({routines.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IonButton size="small" fill="outline" color="medium" onClick={() => setIsCatalogOpen(true)}>
              <IonIcon slot="start" icon={searchOutline} />
              Catálogo
            </IonButton>
            <IonButton size="small" fill="solid" color="primary" onClick={handleCreateNew}>
              <IonIcon slot="start" icon={addOutline} />
              Nueva Rutina
            </IonButton>
          </div>
        </div>

        {/* JSON Routines & Exercises Bar (Download Format / Upload JSON / Export) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '14px',
            padding: '10px 12px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={codeSlashOutline} style={{ color: '#60a5fa', fontSize: '1.15rem' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                Rutinas en JSON
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--ion-color-medium)' }}>
                Descarga la plantilla o sube tus rutinas
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleQuickDownloadTemplate}
              style={{
                background: 'rgba(59, 130, 246, 0.16)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#93c5fd',
                borderRadius: '10px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <IonIcon icon={downloadOutline} />
              Descargar Formato
            </button>

            <button
              type="button"
              onClick={() => quickJsonInputRef.current?.click()}
              style={{
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: '#6ee7b7',
                borderRadius: '10px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <IonIcon icon={cloudUploadOutline} />
              Subir JSON
            </button>

            <button
              type="button"
              onClick={() => setIsJsonModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#cbd5e1',
                borderRadius: '10px',
                padding: '6px 9px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Abrir gestor completo de JSON (Exportar / Pegar)"
            >
              Exportar / Más
            </button>
          </div>

          <input
            ref={quickJsonInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleQuickUploadJsonFile}
          />
        </div>

        {routines.length === 0 ? (
          <IonCard style={{ textAlign: 'center', padding: '36px 20px', borderRadius: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                background: 'var(--ion-color-step-100)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IonIcon icon={barbellOutline} style={{ fontSize: '32px', color: 'var(--ion-color-medium)' }} />
            </div>
            <h3 style={{ fontWeight: 700, margin: '0 0 8px', fontSize: '1.2rem' }}>Sin rutinas aún</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
              Crea tu primera rutina de entrenamiento o añade ejercicios desde el catálogo.
            </p>
            <IonButton color="primary" onClick={handleCreateNew}>
              <IonIcon slot="start" icon={addOutline} />
              Crear Rutina
            </IonButton>
          </IonCard>
        ) : (
          routines.map((routine) => (
            <IonCard
              key={routine.id}
              style={{
                margin: '0 0 14px',
                borderRadius: '16px',
              }}
            >
              <IonCardHeader style={{ padding: '16px 16px 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
                      {routine.name}
                    </IonCardTitle>
                    {routine.description && (
                      <IonCardSubtitle style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--ion-color-medium)' }}>
                        {routine.description}
                      </IonCardSubtitle>
                    )}
                  </div>
                  <IonBadge color="primary" style={{ padding: '4px 10px', borderRadius: '6px', flexShrink: 0 }}>
                    {routine.exercises.length} Ejercicios
                  </IonBadge>
                </div>
              </IonCardHeader>

              <IonCardContent style={{ padding: '4px 16px 16px' }}>
                {/* Exercises summary chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 16px' }}>
                  {routine.exercises.map((item, idx) => (
                    <span key={idx} className="exercise-tag">
                      {item.exerciseName} <span style={{ opacity: 0.65 }}>({item.targetSets}s)</span>
                    </span>
                  ))}
                </div>

                {/* Actions: Seleccionar rutina para entrenar */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <IonButton
                    expand="block"
                    color="primary"
                    style={{ flex: 1, fontWeight: 700, borderRadius: '12px' }}
                    onClick={() => handleStartWorkout(routine)}
                  >
                    <IonIcon slot="start" icon={playOutline} />
                    Iniciar Sesión
                  </IonButton>

                  <IonButton
                    fill="outline"
                    color="medium"
                    style={{ borderRadius: '12px', height: '40px' }}
                    onClick={() => handleEditRoutine(routine)}
                    title="Editar rutina"
                  >
                    <IonIcon slot="icon-only" icon={createOutline} />
                  </IonButton>

                  <IonButton
                    fill="outline"
                    color="danger"
                    style={{ borderRadius: '12px', height: '40px' }}
                    onClick={() => setRoutineToDelete(routine.id)}
                    title="Eliminar rutina"
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        {/* Section: Historial de Entrenamientos Completados */}
        {workoutSessions.length > 0 && (
          <div style={{ marginTop: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <IonIcon icon={trophyOutline} color="warning" style={{ fontSize: '1.4rem' }} />
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Historial de Entrenamientos ({workoutSessions.length})
              </h2>
            </div>

            {workoutSessions.slice(0, 5).map((session) => {
              const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const doneSets = session.exercises.reduce(
                (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                0
              );

              return (
                <IonCard
                  key={session.id}
                  style={{ margin: '0 0 10px', borderRadius: '12px' }}
                >
                  <IonCardContent style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: '8px' }}>
                          <strong style={{ fontSize: '1rem' }}>{session.routineName}</strong>
                          <IonBadge color={doneSets === totalSets ? 'success' : 'primary'}>
                            <IonIcon icon={checkmarkDoneOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            {doneSets}/{totalSets} sets
                          </IonBadge>
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--ion-color-medium)',
                            marginTop: '2px',
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>
                            <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }} />{' '}
                            {formatDateDDMMYYYY(session.date)}
                          </span>
                          {session.durationMinutes && (
                            <span>
                              <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle' }} />{' '}
                              {session.durationMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </div>
        )}

        {/* Routine Form Modal */}
        <RoutineFormModal
          isOpen={isRoutineModalOpen}
          routineToEdit={routineToEdit}
          onClose={() => {
            setIsRoutineModalOpen(false);
            setRoutineToEdit(null);
          }}
          onSaved={() => {
            setIsRoutineModalOpen(false);
            setRoutineToEdit(null);
          }}
        />

        {/* Active Workout Player Modal */}
        <WorkoutPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
        />

        {/* Gamification Center Modal */}
        <GamificationModal
          isOpen={isGamificationOpen}
          onClose={() => setIsGamificationOpen(false)}
        />

        {/* Routines & Exercises JSON Template / Import / Export Modal */}
        <RoutinesJsonModal
          isOpen={isJsonModalOpen}
          onClose={() => setIsJsonModalOpen(false)}
          onSuccessToast={(msg) => setToastMessage(msg)}
        />

        {/* Modal de Catálogo General de Ejercicios */}
        <ExerciseCatalogModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          onSelectExercise={(ex) => {
            setIsCatalogOpen(false);
            setRoutineToEdit({
              id: 'routine-' + Date.now(),
              name: `Rutina: ${ex.name}`,
              exercises: [
                {
                  id: 'cfg-' + Date.now(),
                  exerciseId: ex.id,
                  exerciseName: ex.name,
                  mode: ex.defaultMode,
                  targetSets: 3,
                  targetReps: 10,
                  gifUrl: ex.gifUrl,
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setIsRoutineModalOpen(true);
          }}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={Boolean(routineToDelete)}
          onDidDismiss={() => setRoutineToDelete(null)}
          header="¿Eliminar rutina?"
          message="¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer."
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: () => {
                if (routineToDelete) {
                  deleteRoutine(routineToDelete);
                  setToastMessage('Rutina eliminada correctamente.');
                  setRoutineToDelete(null);
                }
              },
            },
          ]}
        />

        <IonToast
          isOpen={Boolean(toastMessage)}
          message={toastMessage || ''}
          duration={2000}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default WorkoutsPage;

