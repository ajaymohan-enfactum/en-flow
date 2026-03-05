import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Building2,
  FileStack,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/accounts', icon: Building2, label: 'Accounts' },
  { to: '/pitch-library', icon: FileStack, label: 'Pitch Library' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  sales_bd: 'Sales / BD',
  delivery: 'Delivery',
  readonly: 'Read-only',
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{
        background: 'hsl(var(--sidebar-background))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>
            Enfactum
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          style={{ color: 'hsl(var(--sidebar-foreground))' }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn('nav-item', isActive && 'active')}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {currentUser.role === 'admin' && (
          <NavLink
            to="/admin"
            className={cn('nav-item', location.pathname.startsWith('/admin') && 'active')}
            title={collapsed ? 'Admin Settings' : undefined}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Admin Settings</span>}
          </NavLink>
        )}
      </nav>

      {/* User switcher (demo only) */}
      <div className="px-2 py-3 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!collapsed ? (
          <div className="space-y-2">
            <p className="section-label px-2" style={{ color: 'hsl(var(--sidebar-foreground) / 0.5)' }}>Switch user (demo)</p>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = mockUsers.find(u => u.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="w-full text-xs rounded-md border px-2 py-1.5 bg-sidebar-accent text-sidebar-accent-foreground"
              style={{
                background: 'hsl(var(--sidebar-accent))',
                color: 'hsl(var(--sidebar-accent-foreground))',
                borderColor: 'hsl(var(--sidebar-border))',
              }}
            >
              {mockUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({ROLE_LABELS[u.role]})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`${currentUser.name} (${ROLE_LABELS[currentUser.role]})`}>
            <User className="h-4 w-4" style={{ color: 'hsl(var(--sidebar-foreground))' }} />
          </div>
        )}
      </div>
    </aside>
  );
}
