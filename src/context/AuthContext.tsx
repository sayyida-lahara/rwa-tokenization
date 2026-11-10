import React, { createContext, useContext } from 'react';
import type { User, UserRole } from '../types';
import { useData } from './DataContext';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User;
  role: UserRole;
  users: User[];
  loginAsRole: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string) => Promise<boolean>;
  updateUserStatus: (
    userId: string,
    status: 'Active' | 'Suspended' | 'Pending KYC'
  ) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser: user,
    users,
    loginAsRole: loginAsRoleRequest,
    loginWithEmail: loginWithEmailRequest,
    updateUserStatus: updateUserStatusRequest,
    refresh,
  } = useData();
  const { showSuccess, showError } = useToast();

  const loginAsRole = async (newRole: UserRole) => {
    const updatedUser = await loginAsRoleRequest(newRole);
    showSuccess(
      'Demo Account Switched',
      `Now signed in as ${updatedUser.name} (${updatedUser.role.toUpperCase()})`
    );
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const found = await loginWithEmailRequest(email);
    if (found) {
      showSuccess('Signed In Successfully', `Welcome back, ${found.name}`);
      return true;
    }
    showError('Account Not Found', `No demo account registered with ${email}`);
    return false;
  };

  const updateUserStatus = async (
    userId: string,
    status: 'Active' | 'Suspended' | 'Pending KYC'
  ) => {
    const updated = await updateUserStatusRequest(userId, status);
    showSuccess('User Status Updated', `${updated.name} is now marked as ${status}`);
  };

  const refreshUsers = async () => {
    await refresh();
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
