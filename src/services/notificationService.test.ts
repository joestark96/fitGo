import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from './notificationService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { WorkoutSession } from '../types';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    createChannel: vi.fn(),
    schedule: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
  },
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing on non-native platform (web)', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

    const session: WorkoutSession = {
      id: 'session-1',
      routineId: 'r1',
      routineName: 'Pierna Hipertrofia',
      date: '2026-11-02',
      startedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      exercises: [],
      isCompleted: false,
    };

    await notificationService.scheduleWorkoutReminders(session);
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();

    await notificationService.cancelWorkoutReminders();
    expect(LocalNotifications.cancel).not.toHaveBeenCalled();
  });

  it('schedules reminders at 60m and every 30m on native platform', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({ display: 'granted' } as any);
    vi.mocked(LocalNotifications.cancel).mockResolvedValue(undefined as any);
    vi.mocked(LocalNotifications.schedule).mockResolvedValue({ notifications: [] } as any);

    // Workout started 10 minutes ago
    const startedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const session: WorkoutSession = {
      id: 'session-123',
      routineId: 'r1',
      routineName: 'Pecho y Tríceps',
      date: '2026-11-02',
      startedAt,
      exercises: [],
      isCompleted: false,
    };

    await notificationService.scheduleWorkoutReminders(session);

    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    const scheduled = vi.mocked(LocalNotifications.schedule).mock.calls[0][0].notifications;
    expect(scheduled.length).toBeGreaterThanOrEqual(1);

    // First scheduled notification is at 60m (50m in the future)
    expect(scheduled[0].id).toBe(1001);
    expect(scheduled[0].title).toContain('1 hora');
    expect(scheduled[0].body).toContain('Pecho y Tríceps');

    // Second scheduled notification is at 90m
    expect(scheduled[1].id).toBe(1002);
    expect(scheduled[1].title).toContain('1h 30m');
  });

  it('cancels all workout reminder notifications', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(LocalNotifications.cancel).mockResolvedValue(undefined as any);

    await notificationService.cancelWorkoutReminders();

    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: [
        { id: 1001 },
        { id: 1002 },
        { id: 1003 },
        { id: 1004 },
        { id: 1005 },
        { id: 1006 },
        { id: 1007 },
      ],
    });
  });

  it('triggers easter egg notification on native platform', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({ display: 'granted' } as any);
    vi.mocked(LocalNotifications.schedule).mockResolvedValue({ notifications: [] } as any);

    const result = await notificationService.triggerEasterEggNotification();

    expect(result).toBe(true);
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          id: 99999,
          title: expect.stringContaining('Easter Egg'),
          body: expect.stringContaining('12'),
        }),
      ],
    });
  });

  it('does not trigger easter egg notification on non-native platform', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

    const result = await notificationService.triggerEasterEggNotification();

    expect(result).toBe(false);
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
  });
});

