import React from 'react';
import { IonCard, IonCardContent, IonBadge, IonIcon, IonText } from '@ionic/react';
import { informationCircleOutline, heartOutline, checkmarkCircle } from 'ionicons/icons';
import { calculateBmi, getBmiCategory } from '../services/storage';

interface ImcIndicatorProps {
  weightKg: number;
  heightCm: number;
}

export const ImcIndicator: React.FC<ImcIndicatorProps> = ({ weightKg, heightCm }) => {
  const bmi = calculateBmi(weightKg, heightCm);
  const categoryInfo = getBmiCategory(bmi);

  // Position on a 15 - 40 scale for gauge indicator (0% to 100%)
  const minScale = 15;
  const maxScale = 40;
  const clampedBmi = Math.min(Math.max(bmi, minScale), maxScale);
  const percentage = ((clampedBmi - minScale) / (maxScale - minScale)) * 100;

  return (
    <IonCard style={{ margin: '0 0 16px', borderRadius: '16px', overflow: 'hidden' }}>
      <IonCardContent style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--ion-color-medium)', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Composición & Salud
            </div>
            <h2 style={{ margin: '4px 0 2px', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {bmi > 0 ? bmi : '--'} <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ion-color-medium)' }}>IMC</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <IonBadge
              color={categoryInfo.color}
              style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '10px' }}
            >
              {categoryInfo.category}
            </IonBadge>
            <div style={{ fontSize: '0.78rem', color: 'var(--ion-color-medium)', marginTop: '4px', fontWeight: 600 }}>
              Óptimo: {categoryInfo.rangeText}
            </div>
          </div>
        </div>

        {/* Visual Gauge Bar */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <div
            style={{
              position: 'relative',
              height: '12px',
              borderRadius: '6px',
              background:
                'linear-gradient(to right, #3dc2ff 0%, #2dd36f 35%, #ffc409 65%, #eb445a 100%)',
              width: '100%',
            }}
          >
            {bmi > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${percentage}%`,
                  top: '-4px',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  border: '3px solid var(--ion-color-dark)',
                  transition: 'left 0.4s ease',
                }}
              />
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--ion-color-medium)',
              marginTop: '6px',
            }}
          >
            <span>&lt; 18.5 (Bajo)</span>
            <span>18.5 - 24.9 (Normal)</span>
            <span>25 - 29.9 (Sobrepeso)</span>
            <span>≥ 30 (Obesidad)</span>
          </div>
        </div>

        {/* Health Description Advice */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'var(--ion-color-light)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IonIcon icon={heartOutline} color={categoryInfo.color} style={{ fontSize: '1.3rem' }} />
          <span style={{ fontSize: '0.85rem' }}>{categoryInfo.description}</span>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

