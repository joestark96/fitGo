import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateBmi,
  getBmiCategory,
  calculateAge,
  formatDateDDMMYYYY,
  formatDateDDMM,
  calculateCalorieRecommendation,
  StorageService,
  DEFAULT_EXERCISES,
} from './storage';
import { UserProfile, Routine, WeightRecord, FoodEntry } from '../types';

describe('Storage and Fitness Calculations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculateBmi', () => {
    it('calculates BMI accurately', () => {
      // 70 kg, 175 cm => 70 / (1.75^2) = 22.857... => 22.9
      const bmi = calculateBmi(70, 175);
      expect(bmi).toBe(22.9);
    });

    it('returns 0 for non-positive values', () => {
      expect(calculateBmi(0, 170)).toBe(0);
      expect(calculateBmi(70, 0)).toBe(0);
    });
  });

  describe('getBmiCategory', () => {
    it('categorizes underweight correctly', () => {
      const res = getBmiCategory(17.5);
      expect(res.category).toBe('Bajo peso');
      expect(res.color).toBe('warning');
    });

    it('categorizes normal weight correctly', () => {
      const res = getBmiCategory(22.5);
      expect(res.category).toBe('Peso normal');
      expect(res.color).toBe('success');
    });

    it('categorizes overweight correctly', () => {
      const res = getBmiCategory(27.3);
      expect(res.category).toBe('Sobrepeso');
      expect(res.color).toBe('warning');
    });

    it('categorizes obesity grades correctly', () => {
      expect(getBmiCategory(32.0).category).toBe('Obesidad Grado I');
      expect(getBmiCategory(37.0).category).toBe('Obesidad Grado II');
      expect(getBmiCategory(42.0).category).toBe('Obesidad Grado III');
    });
  });

  describe('calculateAge', () => {
    it('calculates age correctly from birth date', () => {
      const age = calculateAge('2000-01-01');
      expect(age).toBeGreaterThanOrEqual(24);
    });

    it('handles empty date safely', () => {
      expect(calculateAge('')).toBe(0);
    });
  });

  describe('formatDateDDMMYYYY and formatDateDDMM', () => {
    it('formats YYYY-MM-DD into DD/MM/YYYY accurately', () => {
      expect(formatDateDDMMYYYY('2026-11-01')).toBe('01/11/2026');
      expect(formatDateDDMMYYYY('1995-05-14')).toBe('14/05/1995');
    });

    it('formats ISO string into DD/MM/YYYY accurately', () => {
      expect(formatDateDDMMYYYY('2026-11-01T21:48:58.000Z')).toBe('01/11/2026');
    });

    it('handles already formatted dd/mm/yyyy', () => {
      expect(formatDateDDMMYYYY('15/08/2026')).toBe('15/08/2026');
    });

    it('formats compact DD/MM for chart labels', () => {
      expect(formatDateDDMM('2026-11-01')).toBe('01/11');
      expect(formatDateDDMM('2026-04-09')).toBe('09/04');
    });

    it('handles empty dates gracefully', () => {
      expect(formatDateDDMMYYYY('')).toBe('');
      expect(formatDateDDMM('')).toBe('');
    });
  });

  describe('StorageService', () => {
    it('detects missing profile initially', () => {
      expect(StorageService.hasUserProfile()).toBe(false);
      expect(StorageService.getUserProfile()).toBeNull();
    });

    it('saves and retrieves user profile correctly', () => {
      const profile: UserProfile = {
        name: 'Carlos Mendoza',
        birthDate: '1995-05-14',
        gender: 'male',
        height: 180,
        targetWeight: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveUserProfile(profile);
      expect(StorageService.hasUserProfile()).toBe(true);

      const retrieved = StorageService.getUserProfile();
      expect(retrieved?.name).toBe('Carlos Mendoza');
      expect(retrieved?.height).toBe(180);
    });

    it('saves, retrieves, and deletes weight records', () => {
      const record1: WeightRecord = {
        id: 'rec-1',
        date: '2026-11-01',
        weightKg: 80,
        heightCm: 180,
        bmi: 24.7,
        waistCm: 84,
        createdAt: new Date().toISOString(),
      };

      StorageService.saveWeightRecord(record1);
      const list = StorageService.getWeightRecords();
      expect(list.length).toBe(1);
      expect(list[0].weightKg).toBe(80);
      expect(list[0].waistCm).toBe(84);

      StorageService.deleteWeightRecord('rec-1');
      expect(StorageService.getWeightRecords().length).toBe(0);
    });

    it('manages routines properly', () => {
      const routines = StorageService.getRoutines();
      expect(routines.length).toBeGreaterThan(0);

      const newRoutine: Routine = {
        id: 'test-routine-1',
        name: 'Rutina Funcional',
        exercises: [
          {
            id: 'cfg-1',
            exerciseId: 'ex-plancha',
            exerciseName: 'Plancha Abdominal',
            mode: 'duration',
            targetSets: 3,
            targetDurationSeconds: 60,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveRoutine(newRoutine);
      const updated = StorageService.getRoutines();
      expect(updated.some((r) => r.id === 'test-routine-1')).toBe(true);
    });

    it('manages food entries and activity levels properly', () => {
      expect(StorageService.getFoodEntries()).toEqual([]);
      expect(StorageService.getActivityLevel()).toBe('light');

      StorageService.saveActivityLevel('moderate');
      expect(StorageService.getActivityLevel()).toBe('moderate');

      const food: FoodEntry = {
        id: 'food-test-1',
        date: '2026-11-01',
        mealType: 'almuerzo',
        name: 'Pechuga de pollo con arroz',
        calories: 500,
        proteinGrams: 40,
        createdAt: new Date().toISOString(),
      };

      StorageService.saveFoodEntry(food);
      const list = StorageService.getFoodEntries();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Pechuga de pollo con arroz');
      expect(list[0].calories).toBe(500);

      StorageService.deleteFoodEntry('food-test-1');
      expect(StorageService.getFoodEntries().length).toBe(0);
    });
  });

  describe('calculateCalorieRecommendation', () => {
    it('calculates baseline calories with Mifflin-St Jeor formula accurately', () => {
      const profile: UserProfile = {
        name: 'Carlos',
        birthDate: '1995-01-01',
        gender: 'male',
        height: 180,
        targetWeight: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Weight 80 kg, height 180 cm, age ~31
      const rec = calculateCalorieRecommendation(profile, 80, 'light');
      expect(rec.bmr).toBeGreaterThan(1600);
      expect(rec.tdee).toBeGreaterThan(rec.bmr);
      expect(rec.targetCalories).toBeLessThan(rec.tdee); // Deficit toward target 75kg
      expect(rec.bmi).toBe(24.7);
    });

    it('handles surplus when target weight is higher than current weight', () => {
      const profile: UserProfile = {
        name: 'Ana',
        birthDate: '2000-01-01',
        gender: 'female',
        height: 165,
        targetWeight: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Current weight 52 kg, target 60 kg => surplus
      const rec = calculateCalorieRecommendation(profile, 52, 'moderate');
      expect(rec.targetCalories).toBeGreaterThan(rec.tdee);
      expect(rec.deficitOrSurplus).toBeGreaterThan(0);
    });
  });
});

