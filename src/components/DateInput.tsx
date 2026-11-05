import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonDatetime,
} from '@ionic/react';
import { calendarOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { formatDateDDMMYYYY, getLocalDateString } from '../services/storage';

interface DateInputProps {
  label: string;
  value: string; // ISO date YYYY-MM-DD or DD/MM/YYYY
  onChange: (isoDate: string) => void;
  required?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerValue, setPickerValue] = useState(
    value && value.includes('-') ? value : getLocalDateString()
  );

  // Sync internal display when value changes externally
  useEffect(() => {
    if (value) {
      if (value.includes('-')) {
        // value is YYYY-MM-DD
        setDisplayValue(formatDateDDMMYYYY(value));
        setPickerValue(value);
      } else if (value.includes('/')) {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Format as user types numbers: converts to dd/mm/yyyy
  const handleInputChange = (raw: string) => {
    // Keep only numbers
    const cleanNumbers = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = '';

    if (cleanNumbers.length > 0) {
      formatted = cleanNumbers.slice(0, 2);
    }
    if (cleanNumbers.length >= 3) {
      formatted += '/' + cleanNumbers.slice(2, 4);
    }
    if (cleanNumbers.length >= 5) {
      formatted += '/' + cleanNumbers.slice(4, 8);
    }

    setDisplayValue(formatted);

    // If full date dd/mm/yyyy is entered, validate and emit ISO format YYYY-MM-DD
    if (cleanNumbers.length === 8) {
      const day = parseInt(cleanNumbers.slice(0, 2), 10);
      const month = parseInt(cleanNumbers.slice(2, 4), 10);
      const year = parseInt(cleanNumbers.slice(4, 8), 10);

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const iso = `${year.toString().padStart(4, '0')}-${month
          .toString()
          .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        onChange(iso);
        setPickerValue(iso);
      }
    } else if (cleanNumbers.length === 0) {
      onChange('');
    }
  };

  const handlePickerConfirm = (selectedIso: string) => {
    if (!selectedIso) return;
    const datePart = selectedIso.split('T')[0];
    setPickerValue(datePart);
    setDisplayValue(formatDateDDMMYYYY(datePart));
    onChange(datePart);
    setShowPickerModal(false);
  };

  return (
    <>
      <IonItem lines="full">
        <div style={{ width: '100%' }}>
          <IonLabel position="stacked" style={{ fontWeight: 600, marginBottom: '6px' }}>
            {label} {required && '*'}
          </IonLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <IonInput
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa (ej. 15/05/1995)"
              value={displayValue}
              onIonInput={(e) => handleInputChange(e.detail.value || '')}
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            />
            <IonButton
              fill="outline"
              size="small"
              color="primary"
              onClick={() => setShowPickerModal(true)}
              style={{ margin: 0, borderRadius: '8px' }}
              title="Abrir calendario"
            >
              <IonIcon slot="icon-only" icon={calendarOutline} />
            </IonButton>
          </div>
        </div>
      </IonItem>

      {/* Calendar Picker Modal */}
      <IonModal
        isOpen={showPickerModal}
        onDidDismiss={() => setShowPickerModal(false)}
        style={{ '--height': 'auto', '--border-radius': '16px' }}
      >
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle style={{ fontSize: '1.05rem' }}>Seleccionar Fecha</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowPickerModal(false)}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <IonDatetime
              presentation="date"
              value={pickerValue}
              onIonChange={(e) => {
                const val = e.detail.value;
                if (typeof val === 'string') {
                  setPickerValue(val.split('T')[0]);
                }
              }}
              style={{ borderRadius: '12px' }}
            />
            <div style={{ width: '100%', marginTop: '14px', marginBottom: '8px' }}>
              <IonButton
                expand="block"
                style={{ fontWeight: 'bold' }}
                onClick={() => handlePickerConfirm(pickerValue)}
              >
                <IonIcon slot="start" icon={checkmarkOutline} />
                Confirmar ({formatDateDDMMYYYY(pickerValue)})
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

