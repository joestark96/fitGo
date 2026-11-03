import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { WorkoutSession } from '../types';

// Channel ID for workout background alerts on Android
const WORKOUT_CHANNEL_ID = 'workout_active_alerts';

// IDs reserved for 60m, 90m, 120m, 150m, 180m, 210m, 240m
const REMINDER_NOTIFICATION_IDS = [1001, 1002, 1003, 1004, 1005, 1006, 1007];

class NotificationService {
  private channelCreated = false;
  private isAppInBackground = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Listen to app background / foreground state
      App.addListener('appStateChange', (state) => {
        this.isAppInBackground = !state.isActive;
      });
    } catch (e) {
      console.warn('App state listener not available:', e);
    }
  }

  /**
   * Request notification permissions on Android / iOS
   */
  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') {
        await this.ensureChannel();
        return true;
      }
      const request = await LocalNotifications.requestPermissions();
      const granted = request.display === 'granted';
      if (granted) {
        await this.ensureChannel();
      }
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Ensure Android notification channel is registered with high importance
   */
  async ensureChannel() {
    if (!Capacitor.isNativePlatform() || this.channelCreated) return;

    try {
      await LocalNotifications.createChannel({
        id: WORKOUT_CHANNEL_ID,
        name: 'Alertas de Entrenamiento Activo',
        description: 'Notificaciones periódicas para sesiones de entrenamiento activas en segundo plano',
        importance: 4, // High importance (sound, heads up / status bar)
        visibility: 1, // Public
        vibration: true,
        sound: undefined,
      });
      this.channelCreated = true;
    } catch (e) {
      console.warn('Error creating notification channel:', e);
    }
  }

  /**
   * Schedule alerts for 1 hour (60 min) and every 30 minutes thereafter (90m, 120m, 150m, 180m, etc.)
   */
  async scheduleWorkoutReminders(session: WorkoutSession) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await this.requestPermissions();
      await this.cancelWorkoutReminders(); // Clear any existing reminders first

      const startTime = new Date(session.startedAt).getTime();
      const now = Date.now();
      const routineName = session.routineName || 'Entrenamiento';

      // Reminder intervals in minutes: 1 hour (60 min) and every 30 min after
      const intervalsMinutes = [60, 90, 120, 150, 180, 210, 240];

      const notificationsToSchedule = [];

      for (let i = 0; i < intervalsMinutes.length; i++) {
        const interval = intervalsMinutes[i];
        const targetTimeMs = startTime + interval * 60 * 1000;

        // Only schedule if the target time is in the future
        if (targetTimeMs > now) {
          const id = REMINDER_NOTIFICATION_IDS[i] || 1000 + i;
          
          let title = '';
          let body = '';

          if (interval === 60) {
            title = '⏱️ ¡1 hora de entrenamiento!';
            body = `Llevas 1 hora con tu sesión activa de "${routineName}". Recuerda hidratarte o finalizarla si terminaste.`;
          } else if (interval === 90) {
            title = '⏱️ ¡1h 30m de entrenamiento!';
            body = `Llevas 1 hora y 30 minutos entrenando "${routineName}". ¿Deseas continuar o finalizar tu sesión?`;
          } else if (interval === 120) {
            title = '⏱️ ¡2 horas de entrenamiento!';
            body = `Tu sesión "${routineName}" lleva 2 horas activa. No olvides guardar tus avances.`;
          } else if (interval === 150) {
            title = '⏱️ ¡2h 30m de entrenamiento!';
            body = `Llevas 2 horas y 30 minutos en tu sesión activa "${routineName}".`;
          } else if (interval === 180) {
            title = '⏱️ ¡3 horas de entrenamiento!';
            body = `Tu sesión de "${routineName}" sigue activa tras 3 horas.`;
          } else {
            const hours = Math.floor(interval / 60);
            const mins = interval % 60;
            const timeLabel = mins > 0 ? `${hours}h ${mins}m` : `${hours} horas`;
            title = `⏱️ ¡${timeLabel} de entrenamiento!`;
            body = `Tu sesión "${routineName}" sigue activa en segundo plano.`;
          }

          notificationsToSchedule.push({
            id,
            title,
            body,
            channelId: WORKOUT_CHANNEL_ID,
            schedule: {
              at: new Date(targetTimeMs),
              allowWhileIdle: true,
            },
            extra: {
              sessionId: session.id,
              interval,
            },
          });
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationsToSchedule,
        });
      }
    } catch (error) {
      console.error('Error scheduling workout reminders:', error);
    }
  }

  /**
   * Cancel all pending workout reminder notifications (called when workout finishes or cancels)
   */
  async cancelWorkoutReminders() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({
        notifications: REMINDER_NOTIFICATION_IDS.map((id) => ({ id })),
      });
    } catch (error) {
      console.warn('Error cancelling workout reminders:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

