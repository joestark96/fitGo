import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonTitle } from '@ionic/react';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBrand = true,
  rightAction,
}) => {
  return (
    <IonHeader>
      <IonToolbar className="fit-navbar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 14px',
            minHeight: '44px',
          }}
        >
          {showBrand ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/favicon.png"
                alt="FitTrack"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    letterSpacing: '-0.3px',
                    color: 'var(--ion-text-color)',
                  }}
                >
                  FitTrack
                </div>
                {subtitle && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--ion-color-medium)',
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <IonTitle style={{ padding: 0, fontWeight: 700, fontSize: '1.1rem' }}>
              {title}
            </IonTitle>
          )}

          {rightAction && (
            <IonButtons slot="end" style={{ margin: 0 }}>
              {rightAction}
            </IonButtons>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};
