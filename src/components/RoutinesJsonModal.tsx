import React, { useState, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import {
  closeOutline,
  downloadOutline,
  cloudUploadOutline,
  codeSlashOutline,
  copyOutline,
  checkmarkCircleOutline,
  shareSocialOutline,
  documentTextOutline,
  trashOutline,
  alertCircleOutline,
  chevronUpOutline,
  chevronDownOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StorageService, getLocalDateString } from '../services/storage';
import { useApp } from '../context/AppContext';

interface RoutinesJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (message: string) => void;
}

export const RoutinesJsonModal: React.FC<RoutinesJsonModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { routines, exercises, refreshData } = useApp();
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [jsonTextInput, setJsonTextInput] = useState<string>('');
  const [showTemplatePreview, setShowTemplatePreview] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerWebDownload = (jsonStr: string, fileName: string) => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveOrShareJsonFile = async (jsonStr: string, fileName: string, dialogTitle: string) => {
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
          // ignore if scoped storage blocks direct overwrite
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
          dialogTitle,
        });
        onSuccessToast(`Archivo ${fileName} listo.`);
        return;
      } catch (err: any) {
        if (err?.message && String(err.message).toLowerCase().includes('cancel')) {
          return;
        }
      }
    }

    triggerWebDownload(jsonStr, fileName);
    onSuccessToast(`Archivo ${fileName} descargado.`);
  };

  const handleDownloadTemplate = async () => {
    setErrorMsg(null);
    const template = StorageService.getRoutinesJsonTemplate();
    const jsonStr = JSON.stringify(template, null, 2);
    await saveOrShareJsonFile(
      jsonStr,
      'fittrack-formato-rutinas.json',
      'Guardar Formato JSON de Rutinas'
    );
  };

  const handleCopyTemplate = async () => {
    setErrorMsg(null);
    const template = StorageService.getRoutinesJsonTemplate();
    const jsonStr = JSON.stringify(template, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      onSuccessToast('Formato JSON copiado al portapapeles.');
    } catch {
      setJsonTextInput(jsonStr);
      onSuccessToast('Formato cargado en el cuadro de texto inferior.');
    }
  };

  const handleExportCurrentRoutines = async () => {
    setErrorMsg(null);
    const exported = StorageService.exportRoutinesAndExercises();
    const jsonStr = JSON.stringify(exported, null, 2);
    const fileName = `fittrack-mis-rutinas-${getLocalDateString()}.json`;
    await saveOrShareJsonFile(jsonStr, fileName, 'Exportar Mis Rutinas JSON');
  };

  const handleClearTextInput = () => {
    setJsonTextInput('');
    setErrorMsg(null);
  };

  const processImportedJson = async (rawText: string) => {
    setErrorMsg(null);
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      setErrorMsg('El archivo o texto no tiene un formato JSON válido. Verifica las comillas y comas.');
      return;
    }

    try {
      const result = await StorageService.importRoutinesAndExercises(parsed, importMode);
      refreshData();
      setJsonTextInput('');
      onSuccessToast(
        `Importación exitosa: ${result.importedRoutines} rutina(s) y ${result.importedExercises} ejercicio(s) nuevos.`
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al importar las rutinas desde el JSON.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await processImportedJson(text);
    } catch {
      setErrorMsg('No se pudo leer el archivo seleccionado.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const templateJsonString = JSON.stringify(StorageService.getRoutinesJsonTemplate(), null, 2);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={
            {
              '--background': 'var(--ion-background-color, #0f172a)',
              paddingTop: '4px',
            } as React.CSSProperties
          }
        >
          <IonTitle style={{ fontWeight: 800, fontSize: '1.05rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={codeSlashOutline} color="primary" />
              <span>Rutinas & Ejercicios JSON</span>
              <IonBadge color="primary" style={{ fontSize: '0.68rem', borderRadius: '8px' }}>
                v1.0.5
              </IonBadge>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="medium">
              <IonIcon icon={closeOutline} style={{ fontSize: '1.5rem' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 14px',
              borderRadius: '14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: DOWNLOAD TEMPLATE FORMAT */}
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(59, 130, 246, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                fontSize: '1.15rem',
                flexShrink: 0,
              }}
            >
              <IonIcon icon={documentTextOutline} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ffffff' }}>
                1. Formato / Plantilla JSON
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ion-color-medium)' }}>
                Descarga la plantilla con instrucciones y ejemplos para llenar tus ejercicios y rutinas
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            <IonButton
              expand="block"
              onClick={handleDownloadTemplate}
              style={
                {
                  '--background': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  '--border-radius': '12px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  margin: 0,
                } as React.CSSProperties
              }
            >
              <IonIcon slot="start" icon={downloadOutline} />
              Descargar Formato
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              color="primary"
              onClick={handleCopyTemplate}
              style={
                {
                  '--border-radius': '12px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  margin: 0,
                } as React.CSSProperties
              }
            >
              <IonIcon slot="start" icon={copyOutline} />
              Copiar Formato
            </IonButton>
          </div>

          <button
            type="button"
            onClick={() => setShowTemplatePreview(!showTemplatePreview)}
            style={{
              marginTop: '10px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#93c5fd',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <IonIcon icon={showTemplatePreview ? chevronUpOutline : chevronDownOutline} />
            <span>
              {showTemplatePreview
                ? 'Ocultar vista previa del formato JSON'
                : 'Ver cómo se llena el formato JSON'}
            </span>
          </button>

          {showTemplatePreview && (
            <pre
              style={{
                marginTop: '10px',
                background: 'rgba(2, 6, 23, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '0.68rem',
                color: '#a7f3d0',
                overflowX: 'auto',
                maxHeight: '220px',
              }}
            >
              {templateJsonString}
            </pre>
          )}
        </div>

        {/* STEP 2: UPLOAD / IMPORT JSON */}
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                fontSize: '1.15rem',
                flexShrink: 0,
              }}
            >
              <IonIcon icon={cloudUploadOutline} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ffffff' }}>
                2. Subir / Importar Rutinas (.JSON)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ion-color-medium)' }}>
                Carga tu archivo JSON con tus rutinas y ejercicios personalizados
              </div>
            </div>
          </div>

          {/* Mode Toggle: Merge vs Replace */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {[
              {
                id: 'merge' as const,
                title: 'Agregar a las actuales',
                sub: 'Conserva tus rutinas existentes',
              },
              {
                id: 'replace' as const,
                title: 'Reemplazar todas',
                sub: 'Sustituye la lista de rutinas',
              },
            ].map((m) => {
              const active = importMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setImportMode(m.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: active
                      ? '1.5px solid #10b981'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: active ? '#6ee7b7' : 'var(--ion-color-medium)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.78rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>{m.sub}</div>
                </button>
              );
            })}
          </div>

          <IonButton
            expand="block"
            onClick={() => fileInputRef.current?.click()}
            style={
              {
                '--background': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '--border-radius': '13px',
                fontWeight: 800,
                height: '46px',
                fontSize: '0.9rem',
                marginBottom: '12px',
              } as React.CSSProperties
            }
          >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Subir Archivo .JSON de Rutinas
          </IonButton>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* Paste JSON Area with Clear Button */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                }}
              >
                O pega aquí tu contenido JSON directamente:
              </span>
              <button
                type="button"
                onClick={handleClearTextInput}
                disabled={jsonTextInput.length === 0}
                style={{
                  background:
                    jsonTextInput.length > 0
                      ? 'rgba(239, 68, 68, 0.14)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    jsonTextInput.length > 0
                      ? '1px solid rgba(239, 68, 68, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: jsonTextInput.length > 0 ? '#fca5a5' : 'var(--ion-color-medium)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: jsonTextInput.length > 0 ? 'pointer' : 'default',
                  opacity: jsonTextInput.length > 0 ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IonIcon icon={trashOutline} />
                Limpiar
              </button>
            </div>

            <textarea
              rows={4}
              value={jsonTextInput}
              onChange={(e) => setJsonTextInput(e.target.value)}
              placeholder='{"routines": [{"name": "Mi Rutina", "exercises": [...]}]}'
              style={{
                width: '100%',
                background: 'rgba(2, 6, 23, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px',
                color: '#f8fafc',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                resize: 'vertical',
              }}
            />
            {jsonTextInput.trim().length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '6px' }}>
                <IonButton
                  expand="block"
                  color="success"
                  size="small"
                  onClick={() => processImportedJson(jsonTextInput)}
                  style={{ '--border-radius': '10px', fontWeight: 800, margin: 0 } as React.CSSProperties}
                >
                  <IonIcon slot="start" icon={checkmarkCircleOutline} />
                  Importar JSON Pegado
                </IonButton>
                <IonButton
                  fill="outline"
                  color="danger"
                  size="small"
                  onClick={handleClearTextInput}
                  style={{ '--border-radius': '10px', fontWeight: 700, margin: 0 } as React.CSSProperties}
                >
                  <IonIcon slot="start" icon={trashOutline} />
                  Limpiar
                </IonButton>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: EXPORT CURRENT ROUTINES */}
        <div
          style={{
            background: 'var(--ion-card-background, rgba(30, 41, 59, 0.7))',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa',
                fontSize: '1.15rem',
                flexShrink: 0,
              }}
            >
              <IonIcon icon={shareSocialOutline} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                3. Exportar Mis Rutinas Actuales ({routines.length})
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--ion-color-medium)' }}>
                Genera un archivo JSON con todas tus rutinas y ejercicios personalizados ({exercises.length} en catálogo)
              </div>
            </div>
          </div>

          <IonButton
            expand="block"
            fill="outline"
            color="tertiary"
            onClick={handleExportCurrentRoutines}
            style={{ '--border-radius': '12px', fontWeight: 800 } as React.CSSProperties}
          >
            <IonIcon slot="start" icon={shareSocialOutline} />
            Exportar Mis Rutinas a .JSON
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};
