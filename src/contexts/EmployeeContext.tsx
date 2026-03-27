import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type Employee = Tables<'employees'>;

// Map DB roles to app permission roles
type AppRole = 'admin' | 'sales_bd' | 'delivery' | 'readonly';

const ROLE_MAP: Record<string, AppRole> = {
  admin: 'admin',
  'sales_bd': 'sales_bd',
  sales: 'sales_bd',
  bd: 'sales_bd',
  delivery: 'delivery',
  readonly: 'readonly',
  viewer: 'readonly',
};

const ROLE_PERMISSIONS: Record<AppRole, Set<string>> = {
  admin: new Set(['create', 'edit', 'delete', 'view', 'add_notes']),
  sales_bd: new Set(['create', 'edit', 'view', 'add_notes']),
  delivery: new Set(['view', 'add_notes']),
  readonly: new Set(['view']),
};

interface EmployeeContextType {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  appRole: AppRole;
  hasPermission: (action: 'create' | 'edit' | 'delete' | 'view' | 'add_notes') => boolean;
}

const EmployeeContext = createContext<EmployeeContextType | null>(null);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email!)
        .maybeSingle();

      if (err) {
        console.error('Failed to fetch employee:', err);
        setError('Could not find your employee record.');
      }
      setEmployee(data);
      setLoading(false);
    };

    fetchEmployee();
  }, [user?.email]);

  const appRole: AppRole = employee?.role
    ? (ROLE_MAP[employee.role.toLowerCase()] ?? 'readonly')
    : 'readonly';

  const hasPermission = (action: string) =>
    ROLE_PERMISSIONS[appRole]?.has(action) ?? false;

  return (
    <EmployeeContext.Provider value={{ employee, loading, error, appRole, hasPermission }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployee must be used within EmployeeProvider');
  return ctx;
}
