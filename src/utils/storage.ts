const memoryStorage = new Map<string, string>();

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    const raw = memoryStorage.get(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    memoryStorage.set(key, JSON.stringify(value));
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    memoryStorage.delete(key);
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}
