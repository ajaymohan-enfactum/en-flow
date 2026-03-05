import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}

export function KPICard({ label, value, subtitle, icon: Icon, accent, className }: KPICardProps) {
  return (
    <div className={cn('kpi-card', accent && 'header-stripe', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="section-label mb-1.5">{label}</p>
          <p className="kpi-value">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
