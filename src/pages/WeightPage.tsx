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
  IonText,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  addOutline,
  scaleOutline,
  trashOutline,
  createOutline,
  pencilOutline,
  trendingDownOutline,
  trendingUpOutline,
  bodyOutline,
  calendarOutline,
  fitnessOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { WeightRecord } from '../types';
import { ImcIndicator } from '../components/ImcIndicator';
import { WeightProgressChart } from '../components/WeightProgressChart';
import { WeightFormModal } from '../components/WeightFormModal';
import { WeightConverterModal } from '../components/WeightConverterModal';
import { calculateBmi, getBmiCategory, formatDateDDMMYYYY } from '../services/storage';
import { AppHeader } from '../components/AppHeader';

export const WeightPage: React.FC = () => {
  const { weightRecords, deleteWeightRecord, profile, saveProfile } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConverterModal, setShowConverterModal] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<WeightRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showGoalAlert, setShowGoalAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const latestRecord = weightRecords.length > 0 ? weightRecords[0] : null;
  const previousRecord = weightRecords.length > 1 ? weightRecords[1] : null;

  const currentWeight = latestRecord ? latestRecord.weightKg : profile?.targetWeight || 70;
  const currentHeight = latestRecord ? latestRecord.heightCm : profile?.height || 170;

  // Comparison with previous record
  const diffFromPrevious =
    latestRecord && previousRecord
      ? Number((latestRecord.weightKg - previousRecord.weightKg).toFixed(1))
      : null;

  // Comparison with goal if set
  const diffFromTarget =
    latestRecord && profile?.targetWeight
      ? Number((latestRecord.weightKg - profile.targetWeight).toFixed(1))
      : null;

  const handleCreateNew = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: WeightRecord) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const handleUpdateGoal = (newWeightStr: string) => {
    if (!profile) return;
    const val = parseFloat(newWeightStr);
    if (isNaN(val) || val <= 0) {
      saveProfile({
        ...profile,
        targetWeight: undefined,
        updatedAt: new Date().toISOString(),
      });
      setToastMessage('Objetivo de peso removido.');
    } else {
      const rounded = Number(val.toFixed(1));
      saveProfile({
        ...profile,
        targetWeight: rounded,
        updatedAt: new Date().toISOString(),
      });
      setToastMessage(`Meta de peso actualizada a ${rounded} kg 🎯`);
    }
  };

  return (
    <IonPage>
      <AppHeader
        subtitle="Peso & Composición"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonButton
              fill="outline"
              size="small"
              onClick={() => setShowConverterModal(true)}
              style={{
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.8rem',
                margin: 0,
              }}
              title="Convertidor de Libras a Kilos"
            >
              <IonIcon slot="start" icon={swapHorizontalOutline} />
              Lb ⇄ Kg
            </IonButton>
            <IonButton
              fill="solid"
              color="primary"
              size="small"
              onClick={handleCreateNew}
              style={{
                borderRadius: '12px',
                fontWeight: 700,
                margin: 0,
              }}
            >
              <IonIcon slot="start" icon={addOutline} />
              Registrar
            </IonButton>
          </div>
        }
      />

      <IonContent className="ion-padding" fullscreen>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <IonCard style={{ margin: 0, borderRadius: '16px', textAlign: 'center' }}>
            <IonCardContent style={{ padding: '16px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ion-color-medium)', fontWeight: 600, textTransform: 'uppercase' }}>
                Peso Actual
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, margin: '4px 0 2px', letterSpacing: '-0.5px' }}>
                {latestRecord ? latestRecord.weightKg : '--'}{' '}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ion-color-medium)' }}>kg</span>
              </div>
              {latestRecord && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)', fontWeight: 600, marginBottom: '6px' }}>
                  ≈ {(latestRecord.weightKg * 2.20462).toFixed(1)} lb
                </div>
              )}
              {diffFromPrevious !== null && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: diffFromPrevious <= 0 ? 'var(--ion-color-success)' : 'var(--ion-color-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                  }}
                >
                  <IonIcon icon={diffFromPrevious <= 0 ? trendingDownOutline : trendingUpOutline} />
                  {diffFromPrevious > 0 ? `+${diffFromPrevious}` : diffFromPrevious} kg vs ant.
                </div>
              )}
            </IonCardContent>
          </IonCard>

          <IonCard
            button
            onClick={() => setShowGoalAlert(true)}
            style={{
              margin: 0,
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px dashed var(--ion-color-step-150)',
              cursor: 'pointer',
            }}
          >
            <IonCardContent style={{ padding: '16px 14px' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--ion-color-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>Objetivo</span>
                <IonIcon icon={pencilOutline} style={{ fontSize: '0.85rem' }} />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, margin: '4px 0', color: 'var(--ion-color-primary)', letterSpacing: '-0.5px' }}>
                {profile?.targetWeight ? profile.targetWeight : '--'}{' '}
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kg</span>
              </div>
              {diffFromTarget !== null ? (
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: Math.abs(diffFromTarget) <= 0.5 ? 'var(--ion-color-success)' : 'var(--ion-color-primary)',
                  }}
                >
                  {diffFromTarget > 0 ? `${diffFromTarget} kg por bajar` : `${Math.abs(diffFromTarget)} kg por subir`}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)' }}>
                  Toca para definir meta
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* Visual IMC Gauge Indicator */}
        <ImcIndicator weightKg={currentWeight} heightCm={currentHeight} />

        {/* Chart Evolution */}
        <WeightProgressChart records={weightRecords} />

        {/* Action Button: Nuevo Registro */}
        <div style={{ margin: '16px 0 24px' }}>
          <IonButton
            expand="block"
            size="large"
            style={{ borderRadius: '12px', fontWeight: 700 }}
            onClick={handleCreateNew}
          >
            <IonIcon slot="start" icon={scaleOutline} />
            Registrar Nuevo Peso / Medidas
          </IonButton>
        </div>

        {/* Section: Historial de Mediciones */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px' }}>
            Historial de Mediciones ({weightRecords.length})
          </h2>

          {weightRecords.length === 0 ? (
            <IonCard style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '16px' }}>
              <IonIcon icon={scaleOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
              <p style={{ color: 'var(--ion-color-medium)', margin: '8px 0 12px' }}>
                Aún no has registrado pesos ni medidas corporales.
              </p>
              <IonButton size="small" onClick={handleCreateNew}>
                Crear primer registro
              </IonButton>
            </IonCard>
          ) : (
            weightRecords.map((record) => {
              const bmiCat = getBmiCategory(record.bmi);
              const hasBodyMeasures =
                record.waistCm || record.hipsCm || record.chestCm || record.armCm || record.thighCm || record.bodyFatPercentage;

              return (
                <IonCard key={record.id} style={{ margin: '0 0 12px', borderRadius: '14px' }}>
                  <IonCardContent style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                            {record.weightKg} kg
                          </span>
                          <IonBadge color={bmiCat.color} style={{ fontSize: '0.8rem', borderRadius: '6px' }}>
                            IMC {record.bmi} ({bmiCat.category})
                          </IonBadge>
                        </div>

                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--ion-color-medium)',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <IonIcon icon={calendarOutline} />
                          {formatDateDDMMYYYY(record.date)} • {record.heightCm} cm
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <IonButton
                          fill="clear"
                          color="medium"
                          size="small"
                          onClick={() => handleEditRecord(record)}
                        >
                          <IonIcon slot="icon-only" icon={createOutline} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="danger"
                          size="small"
                          onClick={() => setRecordToDelete(record.id)}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                      </div>
                    </div>

                    {/* Optional Measurements Display */}
                    {hasBodyMeasures && (
                      <div
                        style={{
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--ion-color-light-shade)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          fontSize: '0.82rem',
                        }}
                      >
                        {record.waistCm && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Cintura: <strong>{record.waistCm} cm</strong>
                          </span>
                        )}
                        {record.hipsCm && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Cadera: <strong>{record.hipsCm} cm</strong>
                          </span>
                        )}
                        {record.chestCm && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Pecho: <strong>{record.chestCm} cm</strong>
                          </span>
                        )}
                        {record.armCm && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Brazo: <strong>{record.armCm} cm</strong>
                          </span>
                        )}
                        {record.thighCm && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Muslo: <strong>{record.thighCm} cm</strong>
                          </span>
                        )}
                        {record.bodyFatPercentage && (
                          <span style={{ background: 'var(--ion-color-light)', padding: '3px 8px', borderRadius: '6px' }}>
                            Grasa: <strong>{record.bodyFatPercentage}%</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {record.notes && (
                      <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--ion-color-medium)', fontStyle: 'italic' }}>
                        &ldquo;{record.notes}&rdquo;
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              );
            })
          )}
        </div>

        {/* Modal for creating / editing weight record */}
        <WeightFormModal
          isOpen={isModalOpen}
          recordToEdit={recordToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setRecordToEdit(null);
          }}
          onSaved={() => {
            setIsModalOpen(false);
            setRecordToEdit(null);
          }}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={Boolean(recordToDelete)}
          onDidDismiss={() => setRecordToDelete(null)}
          header="¿Eliminar registro?"
          message="¿Deseas eliminar este registro de peso y medidas?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: () => {
                if (recordToDelete) deleteWeightRecord(recordToDelete);
              },
            },
          ]}
        />

        {/* Edit Target Weight Goal Alert */}
        <IonAlert
          isOpen={showGoalAlert}
          onDidDismiss={() => setShowGoalAlert(false)}
          header="🎯 Peso Objetivo"
          subHeader="Establece o actualiza tu meta de peso (kg)"
          inputs={[
            {
              name: 'targetWeight',
              type: 'number',
              placeholder: 'ej. 70.0',
              value: profile?.targetWeight ? profile.targetWeight.toString() : '',
              min: 20,
              max: 300,
            },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Guardar',
              handler: (data) => {
                handleUpdateGoal(data.targetWeight);
              },
            },
          ]}
        />

        {/* Feedback Toast */}
        <IonToast
          isOpen={Boolean(toastMessage)}
          message={toastMessage || ''}
          duration={2200}
          onDidDismiss={() => setToastMessage(null)}
          position="bottom"
          color="dark"
        />

        {/* Lbs to Kg Converter Modal */}
        <WeightConverterModal
          isOpen={showConverterModal}
          onClose={() => setShowConverterModal(false)}
          initialKg={latestRecord ? latestRecord.weightKg : profile?.targetWeight || 70}
        />
      </IonContent>
    </IonPage>
  );
};

export default WeightPage;

