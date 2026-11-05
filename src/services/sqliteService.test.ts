import { describe, it, expect, beforeEach } from 'vitest';
import { sqliteService } from './sqliteService';
import { StorageService } from './storage';
import { UserProfile, Routine, FoodEntry, WeightRecord } from '../types';

describe('SQLite and LocalStorage Migration Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes sqliteService gracefully without throwing', async () => {
    await expect(sqliteService.init()).resolves.not.toThrow();
  });

  it('migrates existing user profile from localStorage', async () => {
    const mockProfile: UserProfile = {
      name: 'Elena Rostova',
      birthDate: '1998-03-22',
      gender: 'female',
      height: 168,
      initialWeight: 62,
      targetWeight: 58,
      preferredWeightUnit: 'kg',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    };

    localStorage.setItem('fittrack_user_profile', JSON.stringify(mockProfile));

    // Also legacy key test
    const mockRoutine: Routine = {
      id: 'routine-legacy-1',
      name: 'Rutina Pierna y Glúteo',
      exercises: [],
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    };
    localStorage.setItem('fittrack_routines_list', JSON.stringify([mockRoutine]));

    // Execute migration
    await expect(sqliteService.migrateFromLocalStorage()).resolves.not.toThrow();
  });

  it('runs StorageService.init() and keeps data accessible', async () => {
    const testWeight: WeightRecord = {
      id: 'weight-test-1',
      date: '2026-11-04',
      weightKg: 72.5,
      heightCm: 175,
      bmi: 23.7,
      createdAt: '2026-11-04T12:00:00.000Z',
    };

    StorageService.saveWeightRecord(testWeight);
    await StorageService.init();

    const records = StorageService.getWeightRecords();
    expect(records.some((r) => r.id === 'weight-test-1')).toBe(true);
  });
});
