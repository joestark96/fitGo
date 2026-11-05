import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonInput,
  IonBadge,
  IonChip,
  IonLabel,
} from '@ionic/react';
import {
  closeOutline,
  swapHorizontalOutline,
  calculatorOutline,
  checkmarkOutline,
  copyOutline,
  barbellOutline,
  scaleOutline,
  layersOutline,
} from 'ionicons/icons';

interface WeightConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLbs?: number;
  initialKg?: number;
  onApplyKg?: (kg: number) => void;
  targetInputDescription?: string;
}

const COMMON_DUMBBELLS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80];

// Pulley machine stack configurations
const PULLEY_STANDARD_LBS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200];
const PULLEY_CROSSOVER_LBS = [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 45, 50, 60, 70];
const PULLEY_HEAVY_LBS = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210];

const COMMON_PLATES = [10, 25, 35, 45];
const COMMON_BODY_WEIGHTS = [120, 140, 150, 160, 170, 180, 200, 220];

export const WeightConverterModal: React.FC<WeightConverterModalProps> = ({
  isOpen,
  onClose,
  initialLbs,
  initialKg,
  onApplyKg,
  targetInputDescription,
}) => {
  const [lbsValue, setLbsValue] = useState<string>('50');
  const [kgValue, setKgValue] = useState<string>('22.7');
  const [copied, setCopied] = useState(false);
  const [pulleyType, setPulleyType] = useState<'standard' | 'crossover' | 'heavy'>('standard');

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      if (initialKg !== undefined && initialKg > 0) {
        setKgValue(initialKg.toString());
        setLbsValue((initialKg * 2.20462262).toFixed(1));
      } else if (initialLbs !== undefined && initialLbs > 0) {
        setLbsValue(initialLbs.toString());
        setKgValue((initialLbs * 0.45359237).toFixed(1));
      } else {
        setLbsValue('50');
        setKgValue('22.7');
      }
    }
  }, [isOpen, initialKg, initialLbs]);

  const handleLbsChange = (val: string) => {
    setLbsValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = num * 0.45359237;
      setKgValue(converted >= 10 ? converted.toFixed(1) : converted.toFixed(2));
    } else {
      setKgValue('');
    }
  };

  const handleKgChange = (val: string) => {
    setKgValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = num * 2.20462262;
      setLbsValue(converted >= 10 ? converted.toFixed(1) : converted.toFixed(2));
    } else {
      setLbsValue('');
    }
  };

  const handleSelectPreset = (lbs: number) => {
    setLbsValue(lbs.toString());
    const converted = lbs * 0.45359237;
    setKgValue(converted >= 10 ? converted.toFixed(1) : converted.toFixed(2));
  };

  const handleAddLbs = (addLbs: number) => {
    const current = parseFloat(lbsValue) || 0;
    const newVal = Math.round((current + addLbs) * 10) / 10;
    handleLbsChange(newVal.toString());
  };

  const handleCopy = () => {
    if (kgValue) {
      navigator.clipboard?.writeText(kgValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentKgNum = parseFloat(kgValue) || 0;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.85} breakpoints={[0, 0.85, 1.0]}>
      <IonHeader>
        <IonToolbar className="fit-navbar">
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: 800, letterSpacing: '-0.3px', fontSize: '1.05rem' }}>
            Convertidor Lb ⇄ Kg
          </IonTitle>
          {onApplyKg && currentKgNum > 0 && (
            <IonButtons slot="end">
              <IonButton
                fill="solid"
                color="primary"
                onClick={() => {
                  onApplyKg(Number(currentKgNum.toFixed(1)));
                  onClose();
                }}
                style={{ fontWeight: 700, borderRadius: '10px' }}
              >
                <IonIcon slot="start" icon={checkmarkOutline} />
                Usar
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Banner if a weight input is selected */}
        {onApplyKg && (
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1.5px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '14px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <IonIcon icon={scaleOutline} style={{ color: '#60a5fa', fontSize: '1.3rem', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Casilla de peso seleccionada
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {targetInputDescription || 'Casilla activa'}
                </div>
              </div>
            </div>
            {currentKgNum > 0 && (
              <IonButton
                size="small"
                color="success"
                style={{ fontWeight: 800, margin: 0, borderRadius: '8px', flexShrink: 0 }}
                onClick={() => {
                  onApplyKg(Number(currentKgNum.toFixed(1)));
                  onClose();
                }}
              >
                <IonIcon slot="start" icon={checkmarkOutline} />
                Insertar
              </IonButton>
            )}
          </div>
        )}

        {/* Converter Cards (Bidirectional) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          {/* LBS INPUT */}
          <IonCard
            style={{
              margin: 0,
              borderRadius: '16px',
              border: '1.5px solid var(--ion-color-step-200, #27272a)',
              background: 'var(--ion-color-step-50, #18181b)',
              textAlign: 'center',
            }}
          >
            <IonCardContent style={{ padding: '14px 10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Libras (lb)
              </div>
              <IonInput
                type="number"
                step="0.5"
                value={lbsValue}
                placeholder="0"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--ion-text-color)',
                  background: 'var(--ion-background-color, #121215)',
                  borderRadius: '10px',
                  padding: '4px',
                }}
                onIonInput={(e) => handleLbsChange(e.detail.value || '')}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)', display: 'block', marginTop: '6px' }}>
                Pesas / Dumbbells
              </span>
            </IonCardContent>
          </IonCard>

          {/* Swap icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--ion-color-step-100, #27272a)',
              color: 'var(--ion-color-primary)',
            }}
          >
            <IonIcon icon={swapHorizontalOutline} style={{ fontSize: '20px' }} />
          </div>

          {/* KG INPUT */}
          <IonCard
            style={{
              margin: 0,
              borderRadius: '16px',
              border: '1.5px solid var(--ion-color-primary)',
              background: 'var(--ion-color-step-50, #18181b)',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
            }}
          >
            <IonCardContent style={{ padding: '14px 10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--ion-color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Kilos (kg)
              </div>
              <IonInput
                type="number"
                step="0.1"
                value={kgValue}
                placeholder="0"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--ion-color-primary)',
                  background: 'var(--ion-background-color, #121215)',
                  borderRadius: '10px',
                  padding: '4px',
                }}
                onIonInput={(e) => handleKgChange(e.detail.value || '')}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)', display: 'block', marginTop: '6px' }}>
                Valor oficial
              </span>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Action bar (Copy or Apply) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <IonButton
            expand="block"
            fill="outline"
            color={copied ? 'success' : 'medium'}
            onClick={handleCopy}
            style={{ flex: 1, borderRadius: '12px', fontWeight: 600 }}
          >
            <IonIcon slot="start" icon={copied ? checkmarkOutline : copyOutline} />
            {copied ? '¡Copiado!' : `Copiar ${kgValue || 0} kg`}
          </IonButton>

          {onApplyKg && (
            <IonButton
              expand="block"
              fill="solid"
              color="primary"
              onClick={() => {
                onApplyKg(Number(currentKgNum.toFixed(1)));
                onClose();
              }}
              style={{ flex: 1.3, borderRadius: '12px', fontWeight: 700 }}
            >
              <IonIcon slot="start" icon={checkmarkOutline} />
              Usar en la rutina
            </IonButton>
          )}
        </div>

        {/* Quick Presets Section */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <IonIcon icon={barbellOutline} color="primary" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ion-text-color)' }}>
              Mancuernas de Gimnasio
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMMON_DUMBBELLS.map((lbs) => {
              const eqKg = (lbs * 0.45359237).toFixed(1);
              const isSelected = lbsValue === lbs.toString();
              return (
                <button
                  key={lbs}
                  onClick={() => handleSelectPreset(lbs)}
                  style={{
                    background: isSelected ? 'var(--ion-color-primary)' : 'var(--ion-color-step-100, #27272a)',
                    color: isSelected ? '#ffffff' : 'var(--ion-text-color)',
                    border: isSelected ? '1px solid var(--ion-color-primary)' : '1px solid var(--ion-color-step-150, #3f3f46)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  <span>{lbs} lb</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8, fontWeight: 500 }}>{eqKg} kg</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Máquinas de Polea y Cables (Torre de Placas) */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IonIcon icon={layersOutline} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ion-text-color)' }}>
                Máquinas de Polea y Cables (Torre)
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Elige tipo de torre</span>
          </div>

          {/* Selector de tipo de torre */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '10px',
              overflowX: 'auto',
              paddingBottom: '2px',
              scrollbarWidth: 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setPulleyType('standard')}
              style={{
                flex: 1,
                minWidth: '105px',
                padding: '6px 8px',
                borderRadius: '8px',
                border: pulleyType === 'standard' ? '1.5px solid #38bdf8' : '1px solid #334155',
                background: pulleyType === 'standard' ? 'rgba(56, 189, 248, 0.2)' : '#181e29',
                color: pulleyType === 'standard' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Torre 10 lb (Estándar)
            </button>

            <button
              type="button"
              onClick={() => setPulleyType('crossover')}
              style={{
                flex: 1,
                minWidth: '115px',
                padding: '6px 8px',
                borderRadius: '8px',
                border: pulleyType === 'crossover' ? '1.5px solid #38bdf8' : '1px solid #334155',
                background: pulleyType === 'crossover' ? 'rgba(56, 189, 248, 0.2)' : '#181e29',
                color: pulleyType === 'crossover' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Cruce / Doble (5-7.5 lb)
            </button>

            <button
              type="button"
              onClick={() => setPulleyType('heavy')}
              style={{
                flex: 1,
                minWidth: '105px',
                padding: '6px 8px',
                borderRadius: '8px',
                border: pulleyType === 'heavy' ? '1.5px solid #38bdf8' : '1px solid #334155',
                background: pulleyType === 'heavy' ? 'rgba(56, 189, 248, 0.2)' : '#181e29',
                color: pulleyType === 'heavy' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Torre 15 lb (Pesada)
            </button>
          </div>

          {/* Placas de la torre seleccionada */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(pulleyType === 'standard'
              ? PULLEY_STANDARD_LBS
              : pulleyType === 'crossover'
              ? PULLEY_CROSSOVER_LBS
              : PULLEY_HEAVY_LBS
            ).map((lbs) => {
              const eqKg = (lbs * 0.45359237).toFixed(1);
              const isSelected = parseFloat(lbsValue) === lbs;
              return (
                <button
                  key={lbs}
                  type="button"
                  onClick={() => handleSelectPreset(lbs)}
                  style={{
                    background: isSelected ? '#0284c7' : 'var(--ion-color-step-100, #27272a)',
                    color: isSelected ? '#ffffff' : 'var(--ion-text-color)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid var(--ion-color-step-150, #3f3f46)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    lineHeight: 1.2,
                    minWidth: '46px',
                  }}
                >
                  <span>{lbs} lb</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>{eqKg} kg</span>
                </button>
              );
            })}
          </div>

          {/* Microcarga selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              Pin de microcarga:
            </span>
            <button
              type="button"
              onClick={() => handleAddLbs(2.5)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Suma 2.5 lb (1.1 kg) al peso actual"
            >
              +2.5 lb (+1.1 kg)
            </button>
            <button
              type="button"
              onClick={() => handleAddLbs(5)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Suma 5.0 lb (2.3 kg) al peso actual"
            >
              +5.0 lb (+2.3 kg)
            </button>
          </div>
        </div>

        {/* Olympic Plates & Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <IonIcon icon={calculatorOutline} color="secondary" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ion-text-color)' }}>
              Discos & Barra Olímpica
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMMON_PLATES.map((lbs) => {
              const eqKg = (lbs * 0.45359237).toFixed(1);
              const label = lbs === 45 ? 'Barra / Disco 45 lb' : `Disco ${lbs} lb`;
              const isSelected = lbsValue === lbs.toString();
              return (
                <button
                  key={lbs}
                  onClick={() => handleSelectPreset(lbs)}
                  style={{
                    background: isSelected ? 'var(--ion-color-secondary)' : 'var(--ion-color-step-100, #27272a)',
                    color: isSelected ? '#ffffff' : 'var(--ion-text-color)',
                    border: '1px solid var(--ion-color-step-150, #3f3f46)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {label} ({eqKg} kg)
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Weights */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <IonIcon icon={scaleOutline} color="tertiary" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ion-text-color)' }}>
              Pesos Corporales Habituales
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMMON_BODY_WEIGHTS.map((lbs) => {
              const eqKg = (lbs * 0.45359237).toFixed(1);
              const isSelected = lbsValue === lbs.toString();
              return (
                <button
                  key={lbs}
                  onClick={() => handleSelectPreset(lbs)}
                  style={{
                    background: isSelected ? 'var(--ion-color-tertiary)' : 'var(--ion-color-step-100, #27272a)',
                    color: isSelected ? '#ffffff' : 'var(--ion-text-color)',
                    border: '1px solid var(--ion-color-step-150, #3f3f46)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lbs} lb = {eqKg} kg
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Apply Button if target input is provided */}
        {onApplyKg && currentKgNum > 0 && (
          <div style={{ marginTop: '16px', marginBottom: '14px' }}>
            <IonButton
              expand="block"
              size="large"
              color="success"
              style={{ borderRadius: '14px', fontWeight: 800 }}
              onClick={() => {
                onApplyKg(Number(currentKgNum.toFixed(1)));
                onClose();
              }}
            >
              <IonIcon slot="start" icon={checkmarkOutline} />
              Insertar {currentKgNum.toFixed(1)} kg ({lbsValue} lb) en casilla
            </IonButton>
          </div>
        )}

        {/* Formula reference note */}
        <div
          style={{
            background: 'var(--ion-color-step-50, #18181b)',
            border: '1px solid var(--ion-color-step-100, #27272a)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: 'var(--ion-color-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span><strong>1 libra (lb)</strong> = 0.4536 kg</span>
          <span><strong>1 kilogramo (kg)</strong> = 2.2046 lb</span>
        </div>
      </IonContent>
    </IonModal>
  );
};

