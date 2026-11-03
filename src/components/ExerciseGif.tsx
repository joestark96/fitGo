import React, { useState } from 'react';
import {
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonBadge,
} from '@ionic/react';
import {
  barbellOutline,
  closeOutline,
  expandOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { MuscleGroup } from '../types';

interface ExerciseGifProps {
  gifUrl?: string;
  exerciseName: string;
  muscleGroup?: MuscleGroup | string;
  size?: 'small' | 'medium' | 'large' | 'banner';
  allowZoom?: boolean;
}

export const ExerciseGif: React.FC<ExerciseGifProps> = ({
  gifUrl,
  exerciseName,
  muscleGroup = 'pecho',
  size = 'small',
  allowZoom = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 64, height: 64, borderRadius: 10 };
      case 'medium':
        return { width: 96, height: 96, borderRadius: 12 };
      case 'large':
        return { width: 140, height: 140, borderRadius: 14 };
      case 'banner':
        return { width: '100%', height: 180, borderRadius: 14 };
    }
  };

  const dim = getDimensions();

  const handleOpenZoom = (e: React.MouseEvent) => {
    if (allowZoom && gifUrl && !hasError) {
      e.stopPropagation();
      setIsZoomOpen(true);
    }
  };

  const renderFallback = () => (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        borderRadius: dim.borderRadius,
        background: 'var(--ion-color-step-100, #f1f5f9)',
        border: '1px solid var(--ion-color-step-150, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ion-color-primary)',
        flexShrink: 0,
      }}
    >
      <IonIcon icon={barbellOutline} style={{ fontSize: size === 'small' ? '24px' : '36px' }} />
      {size !== 'small' && (
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--ion-color-medium)', marginTop: '4px' }}>
          {muscleGroup}
        </span>
      )}
    </div>
  );

  return (
    <>
      {gifUrl && !hasError ? (
        <div
          onClick={handleOpenZoom}
          style={{
            position: 'relative',
            width: dim.width,
            height: dim.height,
            borderRadius: dim.borderRadius,
            overflow: 'hidden',
            border: '1px solid var(--ion-color-step-150, #e2e8f0)',
            background: '#ffffff',
            cursor: allowZoom ? 'pointer' : 'default',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={allowZoom ? 'Toca para ampliar animación' : undefined}
        >
          <img
            src={gifUrl}
            alt={exerciseName}
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasError ? 'none' : 'block',
            }}
          />

          {allowZoom && size !== 'small' && (
            <div
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                borderRadius: '6px',
                padding: '2px 4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <IonIcon icon={expandOutline} />
            </div>
          )}
        </div>
      ) : (
        renderFallback()
      )}

      {/* Fullscreen Animation Zoom Modal */}
      {allowZoom && gifUrl && (
        <IonModal
          isOpen={isZoomOpen}
          onDidDismiss={() => setIsZoomOpen(false)}
          style={{ '--height': 'auto', '--border-radius': '16px' }}
        >
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle style={{ fontSize: '1.05rem' }}>Técnica del Ejercicio</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsZoomOpen(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '8px 0 4px', fontWeight: 800 }}>{exerciseName}</h3>
            <div style={{ marginBottom: '14px' }}>
              <IonBadge color="primary" style={{ textTransform: 'capitalize' }}>
                Músculo: {muscleGroup}
              </IonBadge>
            </div>

            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                background: 'var(--ion-color-step-100, #1e293b)',
                border: '1px solid var(--ion-color-step-150, #e2e8f0)',
                margin: '0 auto 16px',
                maxWidth: '360px',
              }}
            >
              <img
                src={gifUrl}
                alt={exerciseName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            <IonButton
              expand="block"
              fill="outline"
              color="medium"
              onClick={() => setIsZoomOpen(false)}
              style={{ marginTop: '12px' }}
            >
              Cerrar visualización
            </IonButton>
          </IonContent>
        </IonModal>
      )}
    </>
  );
};

