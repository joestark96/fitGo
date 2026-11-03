import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { setupIonicReact } from '@ionic/react';
import { StorageService } from './services/storage';
import { AppProvider, useApp } from './context/AppContext';
import { Routine } from './types';

setupIonicReact();

describe('App & Workout Lifecycle Tests', () => {
  it('initializes storage without errors', () => {
    const routines = StorageService.getRoutines();
    expect(routines).toBeDefined();
    expect(routines.length).toBeGreaterThan(0);
  });

  it('starts and finishes workout cleanly via AppContext without crash', () => {
    let currentApp: ReturnType<typeof useApp> | null = null;

    const TestComponent: React.FC = () => {
      currentApp = useApp();
      return <div>Active: {currentApp.activeWorkout ? 'yes' : 'no'}</div>;
    };

    const { getByText } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(currentApp).not.toBeNull();
    const routines = currentApp!.routines;
    expect(routines.length).toBeGreaterThan(0);

    // Start workout
    act(() => {
      currentApp!.startWorkout(routines[0]);
    });
    expect(getByText('Active: yes')).toBeDefined();
    expect(currentApp!.activeWorkout).toBeDefined();

    // Finish workout
    act(() => {
      currentApp!.finishActiveWorkout();
    });
    expect(getByText('Active: no')).toBeDefined();
    expect(currentApp!.activeWorkout).toBeNull();
  });

  it('starts workout safely even with edge case routines (no exercises)', () => {
    let currentApp: ReturnType<typeof useApp> | null = null;

    const TestComponent: React.FC = () => {
      currentApp = useApp();
      return <div>Active: {currentApp.activeWorkout ? 'yes' : 'no'}</div>;
    };

    const { getByText } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const emptyRoutine: Routine = {
      id: 'empty-routine',
      name: 'Empty Routine',
      exercises: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      currentApp!.startWorkout(emptyRoutine);
    });
    expect(getByText('Active: yes')).toBeDefined();
    expect(currentApp!.activeWorkout?.exercises.length).toBe(0);

    act(() => {
      currentApp!.cancelActiveWorkout();
    });
    expect(getByText('Active: no')).toBeDefined();
    expect(currentApp!.activeWorkout).toBeNull();
  });
});

