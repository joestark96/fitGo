import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { chevronForward, calendarOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { WeightRecord } from '../types';
import { calculateBmi } from '../services/storage';

interface WeightQuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (record: WeightRecord) => void;
}

export const WeightQuickRegisterModal: React.FC<WeightQuickRegisterModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { profile, weightRecords, saveWeightRecord } = useApp();

  const [unit, setUnit] = useState<'kg' | 'lbs'>(() => profile?.preferredWeightUnit === 'lb' ? 'lbs' : 'kg');
  const [currentVal, setCurrentVal] = useState<number>(90.7);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Limits
  const minLimit = unit === 'kg' ? 30 : 66;
  const maxLimit = unit === 'kg' ? 250 : 550;

  // Drag interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);

  // Initialize value from existing records when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      setSelectedDate(`${y}-${m}-${d}`);

      let initialKg = 90.7;
      if (weightRecords && weightRecords.length > 0) {
        initialKg = weightRecords[0].weightKg;
      } else if (profile?.targetWeight) {
        initialKg = profile.targetWeight;
      }

      const initialVal = unit === 'kg'
        ? Number(initialKg.toFixed(1))
        : Number((initialKg * 2.20462).toFixed(1));

      setCurrentVal(initialVal);
    }
  }, [isOpen, weightRecords, profile, unit]);

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - lastXRef.current;
    lastXRef.current = currentX;

    // 100px = 1.0 unit -> 10px = 0.1 unit -> 1px = 0.01 unit
    // Dragging finger left moves ruler left (increases value)
    const deltaUnits = -deltaX / 100;
    setCurrentVal((prev) => {
      const newVal = Math.min(Math.max(prev + deltaUnits, minLimit), maxLimit);
      return Math.round(newVal * 10) / 10;
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Mouse drag handlers (for testing / desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const deltaUnits = -deltaX / 100;
    setCurrentVal((prev) => {
      const newVal = Math.min(Math.max(prev + deltaUnits, minLimit), maxLimit);
      return Math.round(newVal * 10) / 10;
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const deltaUnits = (e.deltaX || e.deltaY) > 0 ? 0.1 : -0.1;
    setCurrentVal((prev) => {
      const newVal = Math.min(Math.max(prev + deltaUnits, minLimit), maxLimit);
      return Math.round(newVal * 10) / 10;
    });
  };

  // Switch between KG and LBS
  const handleToggleUnit = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === unit) return;
    let converted: number;
    if (newUnit === 'lbs') {
      converted = Number((currentVal * 2.20462).toFixed(1));
    } else {
      converted = Number((currentVal / 2.20462).toFixed(1));
    }
    setUnit(newUnit);
    setCurrentVal(converted);
  };

  // Date label formatting ("Hoy", "Ayer", or "2 nov")
  const dateButtonLabel = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (selectedDate === todayKey) return 'Hoy';
    if (selectedDate === yesterdayKey) return 'Ayer';

    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      return `${dayNum} ${months[mIdx] || ''}`;
    }
    return selectedDate;
  }, [selectedDate]);

  // Save handler
  const handleSave = () => {
    const finalKg = unit === 'kg' ? currentVal : Number((currentVal / 2.20462).toFixed(1));
    const userHeight = profile?.height || 170;
    const bmi = calculateBmi(finalKg, userHeight);

    const record: WeightRecord = {
      id: 'weight-' + Date.now(),
      date: selectedDate,
      weightKg: finalKg,
      heightCm: userHeight,
      bmi,
      createdAt: new Date().toISOString(),
    };

    saveWeightRecord(record);

    if (onSaved) {
      onSaved(record);
    }
    onClose();
  };

  // Generate ticks around current value (deterministic, renders on frame 0 with 0 latency)
  const renderedTicks = useMemo(() => {
    const baseInt = Math.floor(currentVal);
    const startInt = Math.max(minLimit, baseInt - 4);
    const endInt = Math.min(maxLimit, baseInt + 4);

    const elements: React.ReactNode[] = [];

    for (let intVal = startInt; intVal <= endInt; intVal++) {
      for (let step = 0; step < 10; step++) {
        const val = intVal + step * 0.1;
        if (val < minLimit || val > maxLimit) continue;

        // Position in pixels relative to center needle (100px per integer unit, 10px per 0.1)
        const x = Math.round((val - currentVal) * 100);

        const isInteger = step === 0;
        const isHalf = step === 5;

        if (isInteger) {
          elements.push(
            <div
              key={`tick-${intVal}-${step}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: 0,
                width: '1.5px',
                height: '24px',
                background: '#64748b',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            />
          );

          elements.push(
            <div
              key={`label-${intVal}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: '44px',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'center',
                width: '36px',
                pointerEvents: 'none',
              }}
            >
              {intVal}
            </div>
          );
        } else if (isHalf) {
          elements.push(
            <div
              key={`tick-${intVal}-${step}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: 0,
                width: '1px',
                height: '16px',
                background: '#475569',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            />
          );
        } else {
          elements.push(
            <div
              key={`tick-${intVal}-${step}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: 0,
                width: '1px',
                height: '10px',
                background: '#334155',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            />
          );
        }
      }
    }

    return elements;
  }, [currentVal, minLimit, maxLimit]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.62}
      breakpoints={[0, 0.62]}
      handle={false}
      style={{
        ['--background' as any]: '#171a22',
        ['--border-radius' as any]: '24px 24px 0 0',
      }}
    >
      <div
        style={{
          background: '#171a22',
          padding: '20px 20px 32px',
          boxSizing: 'border-box',
          color: '#ffffff',
          fontFamily: 'inherit',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ================= TOP ROW: Title & Date Selector ================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Peso actual
          </h2>

          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            style={{
              background: '#232a36',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#cbd5e1',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>{dateButtonLabel}</span>
            <IonIcon icon={chevronForward} style={{ fontSize: '0.85rem', color: '#94a3b8' }} />
          </button>
        </div>

        {/* ================= UNIT TOGGLE: kg / lbs ================= */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            style={{
              background: '#222834',
              borderRadius: '24px',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleUnit('kg')}
              style={{
                background: unit === 'kg' ? '#3b82f6' : 'transparent',
                color: unit === 'kg' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 20px',
                fontSize: '0.92rem',
                fontWeight: unit === 'kg' ? 700 : 500,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => handleToggleUnit('lbs')}
              style={{
                background: unit === 'lbs' ? '#3b82f6' : 'transparent',
                color: unit === 'lbs' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 20px',
                fontSize: '0.92rem',
                fontWeight: unit === 'lbs' ? 700 : 500,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              lbs
            </button>
          </div>
        </div>

        {/* ================= BIG WEIGHT DISPLAY ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            marginBottom: '10px',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
            }}
          >
            {currentVal.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            {unit}
          </span>
        </div>

        {/* ================= PURE CSS HORIZONTAL RULER ================= */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            position: 'relative',
            width: '100%',
            height: '66px',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: 'ew-resize',
            userSelect: 'none',
            marginBottom: '18px',
          }}
        >
          {/* Center Blue Needle Indicator */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: '3px',
              height: '34px',
              background: '#3b82f6',
              borderRadius: '2px',
              transform: 'translateX(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '34px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#3b82f6',
              transform: 'translate(-50%, -50%)',
              zIndex: 11,
              pointerEvents: 'none',
            }}
          />

          {/* Ticks container placed horizontally at 50% */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: 0,
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {renderedTicks}
          </div>
        </div>

        {/* ================= ACTION BUTTONS: Cancelar & Guardar ================= */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '8px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '24px',
              background: '#232a36',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '24px',
              background: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Guardar
          </button>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div
            onClick={() => setShowDatePicker(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1b202c',
                borderRadius: '20px',
                padding: '24px 20px',
                width: '100%',
                maxWidth: '320px',
                border: '1px solid #2d3748',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  marginBottom: '16px',
                }}
              >
                <IonIcon icon={calendarOutline} style={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                <span>Fecha del registro</span>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#12161f',
                  border: '1px solid #2d3748',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  padding: '0 14px',
                  marginBottom: '20px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '20px',
                    background: '#3b82f6',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </IonModal>
  );
};

export default WeightQuickRegisterModal;
