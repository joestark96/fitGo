import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

const TICK_WIDTH = 10; // 10px per 0.1 step -> 100px per integer unit (e.g. 90 to 91 is 100px)

export const WeightQuickRegisterModal: React.FC<WeightQuickRegisterModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { profile, weightRecords, saveWeightRecord, saveProfile } = useApp();

  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [currentVal, setCurrentVal] = useState<number>(90.7);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInternalScrollRef = useRef<boolean>(false);

  // Min and max limits depending on active unit
  const minLimit = unit === 'kg' ? 30 : 66;
  const maxLimit = unit === 'kg' ? 250 : 550;

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

      if (unit === 'kg') {
        setCurrentVal(Number(initialKg.toFixed(1)));
      } else {
        setCurrentVal(Number((initialKg * 2.20462).toFixed(1)));
      }
    }
  }, [isOpen, weightRecords, profile, unit]);

  // Center ruler on current value after modal opens
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        if (!scrollContainerRef.current) return;
        const containerWidth = scrollContainerRef.current.clientWidth || 360;
        const targetScrollLeft = Math.round((currentVal - minLimit) * 10 * TICK_WIDTH);
        isInternalScrollRef.current = true;
        scrollContainerRef.current.scrollLeft = targetScrollLeft;
        setTimeout(() => {
          isInternalScrollRef.current = false;
        }, 50);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, minLimit]);

  // Handle scroll event on the ruler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isInternalScrollRef.current) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    const rawVal = minLimit + scrollLeft / (10 * TICK_WIDTH);
    const clamped = Math.min(Math.max(rawVal, minLimit), maxLimit);
    const rounded = Math.round(clamped * 10) / 10;
    if (rounded !== currentVal) {
      setCurrentVal(rounded);
    }
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

    // Scroll to new converted value
    const newMin = newUnit === 'kg' ? 30 : 66;
    setTimeout(() => {
      if (scrollContainerRef.current) {
        isInternalScrollRef.current = true;
        scrollContainerRef.current.scrollLeft = Math.round((converted - newMin) * 10 * TICK_WIDTH);
        setTimeout(() => {
          isInternalScrollRef.current = false;
        }, 50);
      }
    }, 40);
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

    if (profile && profile.targetWeight) {
      // keep profile intact
    }

    if (onSaved) {
      onSaved(record);
    }
    onClose();
  };

  // Compute visible integer ticks around currentVal (virtualized for 120fps performance)
  const visibleIntegers = useMemo(() => {
    const intCenter = Math.floor(currentVal);
    const startInt = Math.max(minLimit, intCenter - 8);
    const endInt = Math.min(maxLimit, intCenter + 8);
    const list: number[] = [];
    for (let i = startInt; i <= endInt; i++) {
      list.push(i);
    }
    return list;
  }, [currentVal, minLimit, maxLimit]);

  const totalRulerWidth = (maxLimit - minLimit) * 10 * TICK_WIDTH;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.52}
      breakpoints={[0, 0.52]}
      handle={true}
      style={{
        ['--background' as any]: '#171a22',
        ['--border-radius' as any]: '24px 24px 0 0',
      }}
    >
      <div
        style={{
          background: '#171a22',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 20px 28px',
          color: '#ffffff',
          fontFamily: 'inherit',
          userSelect: 'none',
        }}
      >
        {/* ================= TOP ROW: Title & Date Selector ================= */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
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
              marginBottom: '16px',
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

          {/* ================= HORIZONTAL RULER PICKER ================= */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '84px',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            {/* Center Blue Needle Indicator */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '0',
                width: '3px',
                height: '40px',
                background: '#3b82f6',
                borderRadius: '2px',
                transform: 'translateX(-50%)',
                zIndex: 10,
                pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.7)',
              }}
            />

            {/* Scrollable Container with Ruler Ticks */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{
                width: '100%',
                height: '100%',
                overflowX: 'scroll',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                position: 'relative',
              }}
            >
              {/* Virtualized inner ruler container */}
              <div
                style={{
                  width: `calc(${totalRulerWidth}px + 100vw)`,
                  height: '100%',
                  position: 'relative',
                  paddingLeft: '50vw',
                  boxSizing: 'border-box',
                }}
              >
                {visibleIntegers.map((intVal) => {
                  const leftPos = (intVal - minLimit) * 10 * TICK_WIDTH;

                  return (
                    <div
                      key={intVal}
                      style={{
                        position: 'absolute',
                        left: `${leftPos}px`,
                        top: 0,
                        width: `${10 * TICK_WIDTH}px`,
                        height: '100%',
                      }}
                    >
                      {/* Integer tick line */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '1.5px',
                          height: '28px',
                          background: '#64748b',
                        }}
                      />

                      {/* Integer number below tick */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '46px',
                          transform: 'translateX(-50%)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#64748b',
                          fontVariantNumeric: 'tabular-nums',
                          textAlign: 'center',
                          width: '36px',
                        }}
                      >
                        {intVal}
                      </div>

                      {/* 9 Minor subdivisions (0.1, 0.2, ..., 0.9) */}
                      {Array.from({ length: 9 }).map((_, stepIdx) => {
                        const stepNum = stepIdx + 1;
                        const isMid = stepNum === 5;
                        const tickX = stepNum * TICK_WIDTH;

                        return (
                          <div
                            key={stepNum}
                            style={{
                              position: 'absolute',
                              left: `${tickX}px`,
                              top: 0,
                              width: '1px',
                              height: isMid ? '20px' : '13px',
                              background: isMid ? '#475569' : '#334155',
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BUTTONS: Cancelar & Guardar ================= */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginTop: '22px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '28px',
              background: '#232a36',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '28px',
              background: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
              transition: 'background 0.2s',
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

