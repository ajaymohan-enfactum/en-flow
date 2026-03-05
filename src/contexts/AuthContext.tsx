import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  hasPermission: (action: 'create' | 'edit' | 'delete' | 'view' | 'add_notes') => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  admin: new Set(['create', 'edit', 'delete', 'view', 'add_notes']),
  sales_bd: new Set(['create', 'edit', 'view', 'add_notes']),
  delivery: new Set(['view', 'add_notes']),
  readonly: new Set(['view']),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // default admin

  const hasPermission = (action: string) => {
    return ROLE_PERMISSIONS[currentUser.role]?.has(action) ?? false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
