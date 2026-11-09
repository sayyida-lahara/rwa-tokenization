import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { MockAuthService } from '../services/mockAuthService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User;
  role: UserRole;
  users: User[];
  loginAsRole: (role: UserRole) => void;
  loginWithEmail: (email: string) => boolean;
  updateUserStatus: (userId: string, status: 'Active' | 'Suspended' | 'Pending KYC') => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => MockAuthService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => MockAuthService.getUsers());
  const { showSuccess, showError } = useToast();

  const refreshUsers = () => {
    setUsers(MockAuthService.getUsers());
    setUser(MockAuthService.getCurrentUser());
  };

  const loginAsRole = (newRole: UserRole) => {
    const updatedUser = MockAuthService.loginAsRole(newRole);
    setUser(updatedUser);
    showSuccess('Demo Account Switched', `Now signed in as ${updatedUser.name} (${updatedUser.role.toUpperCase()})`);
  };

  const loginWithEmail = (email: string): boolean => {
    const found = MockAuthService.loginWithEmail(email);
    if (found) {
      setUser(found);
      showSuccess('Signed In Successfully', `Welcome back, ${found.name}`);
      return true;
    }
    showError('Account Not Found', `No demo account registered with ${email}`);
    return false;
  };

  const updateUserStatus = (userId: string, status: 'Active' | 'Suspended' | 'Pending KYC') => {
    const updated = MockAuthService.updateUserStatus(userId, status);
    if (updated) {
      refreshUsers();
      showSuccess('User Status Updated', `${updated.name} is now marked as ${status}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        users,
        loginAsRole,
        loginWithEmail,
        updateUserStatus,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
