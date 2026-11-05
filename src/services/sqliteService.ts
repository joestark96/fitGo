import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  UserProfile,
  Routine,
  ExerciseDefinition,
  WeightRecord,
  WorkoutSession,
  FoodEntry,
  ActivityLevel,
  DailyActivity,
} from '../types';

const DB_NAME = 'fittrack_db';

class SqliteService {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private initialized = false;
  private isNativeOrWebReady = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Detect JSDOM / Vitest testing environment where native SQLite and Wasm DOM are not supported
    const isTestEnv =
      typeof navigator !== 'undefined' &&
      (navigator.userAgent.includes('jsdom') ||
        (typeof process !== 'undefined' && Boolean(process.env?.VITEST)));

    if (isTestEnv) {
      this.initialized = true;
      return;
    }

    // Strict safety timeout: SQLite init must NEVER hang or block execution (max 2 seconds)
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!this.initialized) {
          console.warn('[FitTrack SQLite] Init safety timeout reached, continuing with storage adapter');
          this.initialized = true;
          resolve();
        }
      }, 2000);
    });

    const initWorker = async () => {
      try {
        this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        const platform = Capacitor.getPlatform();

        // On web, attempt jeep-sqlite web store with strict timeouts
        if (platform === 'web') {
          if (typeof window === 'undefined') {
            this.initialized = true;
            return;
          }

          try {
            const { defineCustomElements: jeepSqlite } = await import('jeep-sqlite/loader');
            jeepSqlite(window);

            await Promise.race([
              customElements.whenDefined('jeep-sqlite'),
              new Promise((_, reject) => setTimeout(() => reject(new Error('jeep-sqlite define timeout')), 800)),
            ]);

            let jeepEl = document.querySelector('jeep-sqlite');
            if (!jeepEl) {
              jeepEl = document.createElement('jeep-sqlite');
              jeepEl.setAttribute('wasm-path', './assets');
              document.body.appendChild(jeepEl);
            }

            await Promise.race([
              this.sqliteConnection.initWebStore(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('initWebStore timeout')), 800)),
            ]);
          } catch (webErr) {
            console.warn('[FitTrack SQLite] WebStore initialization note (using localStorage on web):', webErr);
            this.initialized = true;
            return;
          }
        }

        // Check existing connection or create a new one
        const isConn = await this.sqliteConnection.isConnection(DB_NAME, false);
        if (isConn.result) {
          this.db = await this.sqliteConnection.retrieveConnection(DB_NAME, false);
        } else {
          this.db = await this.sqliteConnection.createConnection(
            DB_NAME,
            false,
            'no-encryption',
            1,
            false
          );
        }

        await this.db.open();
        this.isNativeOrWebReady = true;

        // Create database schema
        await this.createSchema();

        // Migrate existing localStorage data to SQLite if not done yet
        await this.migrateFromLocalStorage();

        this.initialized = true;
        console.log(`[FitTrack SQLite] Database "${DB_NAME}" initialized successfully on ${platform}`);
      } catch (err) {
        console.warn('[FitTrack SQLite] Falling back to storage adapter (non-blocking):', err);
        this.initialized = true;
      }
    };

    await Promise.race([initWorker(), timeoutPromise]);
  }

  public isReady(): boolean {
    return this.isNativeOrWebReady && this.db !== null;
  }

  private async flushWebStore(): Promise<void> {
    if (Capacitor.getPlatform() === 'web' && this.sqliteConnection) {
      try {
        await this.sqliteConnection.saveToStore(DB_NAME);
      } catch (e) {
        // Ignored if not using web store
      }
    }
  }

  private async createSchema(): Promise<void> {
    if (!this.db) return;

    const schema = `
      CREATE TABLE IF NOT EXISTS migrations (
        key TEXT PRIMARY KEY,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS weight_records (
        id TEXT PRIMARY KEY,
        date TEXT,
        weightKg REAL,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        date TEXT,
        routineName TEXT,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS food_entries (
        id TEXT PRIMARY KEY,
        date TEXT,
        mealType TEXT,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS daily_activities (
        date TEXT PRIMARY KEY,
        steps INTEGER,
        caloriesBurned INTEGER,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS active_workout (
        id TEXT PRIMARY KEY,
        data TEXT
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    await this.db.execute(schema);
    await this.flushWebStore();
  }

  /**
   * Automatically migrates any legacy or current data from localStorage into SQLite
   */
  public async migrateFromLocalStorage(): Promise<void> {
    if (!this.db) return;

    try {
      const checkRes = await this.db.query(
        "SELECT completed_at FROM migrations WHERE key = 'localstorage_migration'"
      );
      if (checkRes.values && checkRes.values.length > 0) {
        return; // Already migrated previously
      }

      console.log('[FitTrack SQLite] Starting migration from localStorage to SQLite...');

      // 1. Profile
      const rawProfile =
        localStorage.getItem('fittrack_user_profile') || localStorage.getItem('fittrack_profile');
      if (rawProfile) {
        await this.db.run("INSERT OR REPLACE INTO profile (id, data) VALUES ('current', ?)", [
          rawProfile,
        ]);
      }

      // 2. Exercises
      const rawExercises =
        localStorage.getItem('fittrack_exercise_catalog') ||
        localStorage.getItem('fittrack_exercises');
      if (rawExercises) {
        try {
          const list: ExerciseDefinition[] = JSON.parse(rawExercises);
          if (Array.isArray(list)) {
            for (const ex of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO exercises (id, name, category, data) VALUES (?, ?, ?, ?)',
                [ex.id, ex.name || '', ex.muscleGroup || '', JSON.stringify(ex)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating exercises:', e);
        }
      }

      // 3. Routines
      const rawRoutines =
        localStorage.getItem('fittrack_routines_list') || localStorage.getItem('fittrack_routines');
      if (rawRoutines) {
        try {
          const list: Routine[] = JSON.parse(rawRoutines);
          if (Array.isArray(list)) {
            for (const r of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO routines (id, name, data) VALUES (?, ?, ?)',
                [r.id, r.name || '', JSON.stringify(r)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating routines:', e);
        }
      }

      // 4. Weight Records
      const rawWeights =
        localStorage.getItem('fittrack_weight_history') ||
        localStorage.getItem('fittrack_weight_records');
      if (rawWeights) {
        try {
          const list: WeightRecord[] = JSON.parse(rawWeights);
          if (Array.isArray(list)) {
            for (const w of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO weight_records (id, date, weightKg, data) VALUES (?, ?, ?, ?)',
                [w.id, w.date || '', w.weightKg || 0, JSON.stringify(w)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating weight records:', e);
        }
      }

      // 5. Workout Sessions
      const rawSessions =
        localStorage.getItem('fittrack_workout_history') ||
        localStorage.getItem('fittrack_workout_sessions');
      if (rawSessions) {
        try {
          const list: WorkoutSession[] = JSON.parse(rawSessions);
          if (Array.isArray(list)) {
            for (const s of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO workout_sessions (id, date, routineName, data) VALUES (?, ?, ?, ?)',
                [s.id, s.date || '', s.routineName || '', JSON.stringify(s)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating workout sessions:', e);
        }
      }

      // 6. Food Entries
      const rawFood = localStorage.getItem('fittrack_food_entries');
      if (rawFood) {
        try {
          const list: FoodEntry[] = JSON.parse(rawFood);
          if (Array.isArray(list)) {
            for (const f of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO food_entries (id, date, mealType, data) VALUES (?, ?, ?, ?)',
                [f.id, f.date || '', f.mealType || '', JSON.stringify(f)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating food entries:', e);
        }
      }

      // 7. Daily Activities
      const rawActivities = localStorage.getItem('fittrack_daily_activities');
      if (rawActivities) {
        try {
          const list: DailyActivity[] = JSON.parse(rawActivities);
          if (Array.isArray(list)) {
            for (const a of list) {
              await this.db.run(
                'INSERT OR REPLACE INTO daily_activities (date, steps, caloriesBurned, data) VALUES (?, ?, ?, ?)',
                [a.date, a.steps || 0, a.caloriesBurned || 0, JSON.stringify(a)]
              );
            }
          }
        } catch (e) {
          console.warn('[FitTrack SQLite] Error migrating daily activities:', e);
        }
      }

      // 8. Activity Level
      const rawLevel =
        localStorage.getItem('fittrack_user_activity_level') ||
        localStorage.getItem('fittrack_activity_level');
      if (rawLevel) {
        await this.db.run(
          "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('activity_level', ?)",
          [rawLevel]
        );
      }

      // 9. Active Workout
      const rawActiveWorkout = localStorage.getItem('fittrack_active_workout');
      if (rawActiveWorkout) {
        await this.db.run(
          "INSERT OR REPLACE INTO active_workout (id, data) VALUES ('active', ?)",
          [rawActiveWorkout]
        );
      }

      // Mark migration done
      await this.db.run(
        "INSERT OR REPLACE INTO migrations (key, completed_at) VALUES ('localstorage_migration', ?)",
        [new Date().toISOString()]
      );

      await this.flushWebStore();
      console.log('[FitTrack SQLite] ✓ LocalStorage data successfully migrated to SQLite!');
    } catch (err) {
      console.error('[FitTrack SQLite] Migration error:', err);
    }
  }

  // --- Profile ---
  public async getProfile(): Promise<UserProfile | null> {
    if (!this.db) return null;
    try {
      const res = await this.db.query("SELECT data FROM profile WHERE id = 'current'");
      if (res.values && res.values.length > 0 && res.values[0].data) {
        return JSON.parse(res.values[0].data) as UserProfile;
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getProfile error:', e);
    }
    return null;
  }

  public async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run("INSERT OR REPLACE INTO profile (id, data) VALUES ('current', ?)", [
        JSON.stringify(profile),
      ]);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveProfile error:', e);
    }
  }

  // --- Exercises ---
  public async getExercises(): Promise<ExerciseDefinition[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM exercises');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as ExerciseDefinition);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getExercises error:', e);
    }
    return [];
  }

  public async saveExercise(exercise: ExerciseDefinition): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO exercises (id, name, category, data) VALUES (?, ?, ?, ?)',
        [exercise.id, exercise.name || '', exercise.muscleGroup || '', JSON.stringify(exercise)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveExercise error:', e);
    }
  }

  public async saveAllExercises(exercises: ExerciseDefinition[]): Promise<void> {
    if (!this.db) return;
    try {
      for (const ex of exercises) {
        await this.db.run(
          'INSERT OR REPLACE INTO exercises (id, name, category, data) VALUES (?, ?, ?, ?)',
          [ex.id, ex.name || '', ex.muscleGroup || '', JSON.stringify(ex)]
        );
      }
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveAllExercises error:', e);
    }
  }

  // --- Routines ---
  public async getRoutines(): Promise<Routine[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM routines');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as Routine);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getRoutines error:', e);
    }
    return [];
  }

  public async saveRoutine(routine: Routine): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO routines (id, name, data) VALUES (?, ?, ?)',
        [routine.id, routine.name || '', JSON.stringify(routine)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveRoutine error:', e);
    }
  }

  public async deleteRoutine(id: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run('DELETE FROM routines WHERE id = ?', [id]);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] deleteRoutine error:', e);
    }
  }

  // --- Weight Records ---
  public async getWeightRecords(): Promise<WeightRecord[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM weight_records ORDER BY date DESC');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as WeightRecord);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getWeightRecords error:', e);
    }
    return [];
  }

  public async saveWeightRecord(record: WeightRecord): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO weight_records (id, date, weightKg, data) VALUES (?, ?, ?, ?)',
        [record.id, record.date || '', record.weightKg || 0, JSON.stringify(record)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveWeightRecord error:', e);
    }
  }

  public async deleteWeightRecord(id: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run('DELETE FROM weight_records WHERE id = ?', [id]);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] deleteWeightRecord error:', e);
    }
  }

  // --- Workout Sessions ---
  public async getWorkoutSessions(): Promise<WorkoutSession[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM workout_sessions ORDER BY date DESC');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as WorkoutSession);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getWorkoutSessions error:', e);
    }
    return [];
  }

  public async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO workout_sessions (id, date, routineName, data) VALUES (?, ?, ?, ?)',
        [session.id, session.date || '', session.routineName || '', JSON.stringify(session)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveWorkoutSession error:', e);
    }
  }

  public async deleteWorkoutSession(id: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run('DELETE FROM workout_sessions WHERE id = ?', [id]);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] deleteWorkoutSession error:', e);
    }
  }

  // --- Food Entries ---
  public async getFoodEntries(): Promise<FoodEntry[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM food_entries ORDER BY date DESC');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as FoodEntry);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getFoodEntries error:', e);
    }
    return [];
  }

  public async saveFoodEntry(entry: FoodEntry): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO food_entries (id, date, mealType, data) VALUES (?, ?, ?, ?)',
        [entry.id, entry.date || '', entry.mealType || '', JSON.stringify(entry)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveFoodEntry error:', e);
    }
  }

  public async deleteFoodEntry(id: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run('DELETE FROM food_entries WHERE id = ?', [id]);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] deleteFoodEntry error:', e);
    }
  }

  // --- Daily Activities ---
  public async getDailyActivities(): Promise<DailyActivity[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT data FROM daily_activities');
      if (res.values) {
        return res.values.map((row: any) => JSON.parse(row.data) as DailyActivity);
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getDailyActivities error:', e);
    }
    return [];
  }

  public async saveDailyActivity(activity: DailyActivity): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        'INSERT OR REPLACE INTO daily_activities (date, steps, caloriesBurned, data) VALUES (?, ?, ?, ?)',
        [activity.date, activity.steps || 0, activity.caloriesBurned || 0, JSON.stringify(activity)]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveDailyActivity error:', e);
    }
  }

  // --- App Settings (e.g. Activity Level) ---
  public async getActivityLevel(): Promise<ActivityLevel> {
    if (!this.db) return 'light';
    try {
      const res = await this.db.query(
        "SELECT value FROM app_settings WHERE key = 'activity_level'"
      );
      if (res.values && res.values.length > 0 && res.values[0].value) {
        return res.values[0].value as ActivityLevel;
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getActivityLevel error:', e);
    }
    return 'light';
  }

  public async saveActivityLevel(level: ActivityLevel): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('activity_level', ?)",
        [level]
      );
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveActivityLevel error:', e);
    }
  }

  // --- Active Workout ---
  public async getActiveWorkout(): Promise<WorkoutSession | null> {
    if (!this.db) return null;
    try {
      const res = await this.db.query("SELECT data FROM active_workout WHERE id = 'active'");
      if (res.values && res.values.length > 0 && res.values[0].data) {
        return JSON.parse(res.values[0].data) as WorkoutSession;
      }
    } catch (e) {
      console.warn('[FitTrack SQLite] getActiveWorkout error:', e);
    }
    return null;
  }

  public async saveActiveWorkout(workout: WorkoutSession | null): Promise<void> {
    if (!this.db) return;
    try {
      if (!workout) {
        await this.db.run("DELETE FROM active_workout WHERE id = 'active'");
      } else {
        await this.db.run(
          "INSERT OR REPLACE INTO active_workout (id, data) VALUES ('active', ?)",
          [JSON.stringify(workout)]
        );
      }
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] saveActiveWorkout error:', e);
    }
  }

  // --- Clear All ---
  public async clearAllData(): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.execute(`
        DELETE FROM profile;
        DELETE FROM exercises;
        DELETE FROM routines;
        DELETE FROM weight_records;
        DELETE FROM workout_sessions;
        DELETE FROM food_entries;
        DELETE FROM daily_activities;
        DELETE FROM active_workout;
        DELETE FROM app_settings;
      `);
      await this.flushWebStore();
    } catch (e) {
      console.warn('[FitTrack SQLite] clearAllData error:', e);
    }
  }
}

export const sqliteService = new SqliteService();
