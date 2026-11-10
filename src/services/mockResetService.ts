const DEMO_STORAGE_PREFIX = 'assetx_';

/**
 * Clears every persisted demo key (assets, holdings, transactions, users,
 * wallet, watchlist, preferences and marketplace settings) so the next load
 * starts from the seeded sample data.
 */
export class MockResetService {
  static resetAllDemoData(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(DEMO_STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Unable to reset demo storage:', error);
    }
  }
}
