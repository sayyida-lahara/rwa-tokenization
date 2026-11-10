import { getStorageItem, setStorageItem } from '../utils/storage';

export interface UserPreferences {
  emailAlerts: boolean;
  dividendAlerts: boolean;
}

const PREFERENCES_STORAGE_KEY = 'assetx_user_preferences_v1';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  emailAlerts: true,
  dividendAlerts: true,
};

type PreferenceStore = Record<string, UserPreferences>;

export class MockPreferenceService {
  private static getAll(): PreferenceStore {
    return getStorageItem<PreferenceStore>(PREFERENCES_STORAGE_KEY, {});
  }

  static getForUser(userId: string): UserPreferences {
    const store = this.getAll();
    return { ...DEFAULT_USER_PREFERENCES, ...(store[userId] || {}) };
  }

  static saveForUser(userId: string, preferences: UserPreferences): UserPreferences {
    const store = this.getAll();
    const normalized: UserPreferences = {
      emailAlerts: Boolean(preferences.emailAlerts),
      dividendAlerts: Boolean(preferences.dividendAlerts),
    };
    store[userId] = normalized;
    setStorageItem(PREFERENCES_STORAGE_KEY, store);
    return normalized;
  }

  static reset(): void {
    setStorageItem(PREFERENCES_STORAGE_KEY, {});
  }
}
