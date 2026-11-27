import React, { useEffect, useState } from 'react';
import { IonAlert } from '@ionic/react';
import {
  AppUpdateInfo,
  checkForAppUpdate,
  openUpdateDownload,
} from '../services/updateService';

export const AppUpdateChecker: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const info = await checkForAppUpdate();
      if (!cancelled && info?.hasUpdate) {
        setUpdateInfo(info);
        setIsOpen(true);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!updateInfo) return null;

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={() => setIsOpen(false)}
      header={`¡Nueva versión disponible! (v${updateInfo.latestVersion})`}
      message={`Tienes instalada la versión v${updateInfo.currentVersion}. Ya está disponible fitGo! v${updateInfo.latestVersion} en GitHub.`}
      buttons={[
        {
          text: 'Más tarde',
          role: 'cancel',
        },
        {
          text: 'Descargar APK',
          handler: () => {
            openUpdateDownload(updateInfo);
          },
        },
      ]}
    />
  );
};
