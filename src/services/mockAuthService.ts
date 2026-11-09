import type { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockUsers';
import { getStorageItem, setStorageItem } from '../utils/storage';

const USERS_STORAGE_KEY = 'assetx_users_v2';
const CURRENT_USER_KEY = 'assetx_current_user_v2';

export class MockAuthService {
  private static init(): User[] {
    const existing = getStorageItem<User[] | null>(USERS_STORAGE_KEY, null);
    if (!existing || existing.length === 0) {
      setStorageItem(USERS_STORAGE_KEY, INITIAL_USERS);
      return INITIAL_USERS;
    }
    return existing;
  }

  static getUsers(): User[] {
    return this.init();
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const stored = getStorageItem<User | null>(CURRENT_USER_KEY, null);
    if (stored) {
      const match = users.find((u) => u.id === stored.id);
      if (match) return match;
    }
    // Default to investor demo account
    const defaultUser = users[0];
    setStorageItem(CURRENT_USER_KEY, defaultUser);
    return defaultUser;
  }

  static setCurrentUser(user: User): void {
    setStorageItem(CURRENT_USER_KEY, user);
  }

  static loginAsRole(role: UserRole): User {
    const users = this.getUsers();
    const target = users.find((u) => u.role === role) || users[0];
    this.setCurrentUser(target);
    return target;
  }

  static loginWithEmail(email: string): User | null {
    const user = this.getUserByEmail(email);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  static updateUserStatus(userId: string, status: 'Active' | 'Suspended' | 'Pending KYC'): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], accountStatus: status };
    setStorageItem(USERS_STORAGE_KEY, users);

    // If current user modified, update session
    const current = getStorageItem<User | null>(CURRENT_USER_KEY, null);
    if (current && current.id === userId) {
      setStorageItem(CURRENT_USER_KEY, users[index]);
    }

    return users[index];
  }
}
