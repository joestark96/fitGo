import { describe, it, expect } from 'vitest';
import { StorageService } from './services/storage';

describe('App Smoke Test', () => {
  it('initializes storage without errors', () => {
    const routines = StorageService.getRoutines();
    expect(routines).toBeDefined();
    expect(routines.length).toBeGreaterThan(0);
  });
});
