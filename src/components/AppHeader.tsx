import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonIcon } from '@ionic/react';
import { flameOutline, trophyOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { GamificationModal } from './GamificationModal';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  rightAction?: React.ReactNode;
  onBrandClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBrand = true,
  rightAction,
  onBrandClick,
}) => {
  const { gamification } = useApp();
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);

  return (
    <>
      <IonHeader>
        <IonToolbar className="fit-navbar">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 14px',
              minHeight: '44px',
              gap: '8px',
            }}
          >
            {showBrand ? (
              <div
                onClick={onBrandClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: onBrandClick ? 'pointer' : 'default',
                  userSelect: 'none',
                  minWidth: 0,
                }}
              >
                <img
                  src="/favicon.png"
                  alt="fitGo"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      letterSpacing: '-0.3px',
                      color: 'var(--ion-text-color)',
                    }}
                  >
                    fitGo
                  </div>
                  {subtitle && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--ion-color-medium)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Live Gamification Pill (Streak + Level) */}
              <button
                type="button"
                onClick={() => setIsGamificationOpen(true)}
                title="Abrir Centro de Atleta, Misiones y Trofeos"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(30, 41, 59, 0.85)',
                  border: '1px solid rgba(59, 130, 246, 0.38)',
                  borderRadius: '999px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  color: '#f8fafc',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                }}
              >
                <span style={{ color: '#fb923c', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <IonIcon icon={flameOutline} style={{ fontSize: '0.88rem' }} />
                  {gamification.activeStreakDays}d
                </span>
                <span style={{ opacity: 0.35 }}>|</span>
                <span style={{ color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <IonIcon icon={trophyOutline} style={{ fontSize: '0.85rem' }} />
                  Nv.{gamification.level}
                </span>
              </button>

              {rightAction && (
                <IonButtons slot="end" style={{ margin: 0 }}>
                  {rightAction}
                </IonButtons>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
      />
    </>
  );
};
