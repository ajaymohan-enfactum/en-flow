import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { KPICard } from '@/components/KPICard';
import { FollowupBadge, StageBadge } from '@/components/StatusBadges';
import { formatSGD, formatDate } from '@/lib/format';
import { useDeals } from '@/hooks/useDeals';
import { useEmployee } from '@/contexts/EmployeeContext';
import { mockTasks, mockActivities, mockArtifacts, getUserById, getAccountById } from '@/data/mockData';
import { getFollowupStatus } from '@/types';
import {
  DollarSign, TrendingUp, Target, AlertTriangle, CheckCircle, Clock,
  Plus, FileText, ListTodo, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { employee } = useEmployee();
  const { data: deals = [], isLoading } = useDeals();

  const openDeals = useMemo(() => deals.filter(d => d.stage && !['Closed', 'Lost', 'Won'].includes(d.stage)), [deals]);
  const totalPipeline = useMemo(() => openDeals.reduce((s, d) => s + (d.value ?? 0), 0), [openDeals]);
  const weightedPipeline = useMemo(() => openDeals.reduce((s, d) => s + (d.value ?? 0) * (d.win_probability ?? 0), 0), [openDeals]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return mockTasks.filter(t => t.status === 'Open' && t.due_date && new Date(t.due_date) < now);
  }, []);

  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return mockTasks.filter(t => t.status === 'Open' && t.due_date && new Date(t.due_date) >= now && new Date(t.due_date) <= week);
  }, []);

  const recentActivities = useMemo(() => {
    return [...mockActivities].sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()).slice(0, 6);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <span className="text-xs text-muted-foreground">Funnel Manager</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {employee?.name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" />Opportunity</Button>
          <Button size="sm" variant="secondary" className="h-8 text-xs"><ListTodo className="h-3 w-3 mr-1" />Task</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard label="Total Pipeline" value={formatSGD(totalPipeline)} icon={DollarSign} accent />
        <KPICard label="Weighted Pipeline" value={formatSGD(weightedPipeline)} icon={TrendingUp} accent />
        <KPICard label="Open Deals" value={openDeals.length} icon={Target} accent />
        <KPICard label="All Deals" value={deals.length} icon={FileText} />
        <KPICard label="Overdue Tasks" value={overdueTasks.length} icon={AlertTriangle} />
        <KPICard label="Due Next 7d" value={dueSoonTasks.length} icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Deals */}
        <div className="data-panel">
          <div className="flex items-center justify-between mb-3">
            <h2 className="consulting-headline">Top Deals</h2>
            <Badge variant="outline" className="text-[10px]">{openDeals.length} open</Badge>
          </div>
          {openDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No open deals.</p>
          ) : (
            <div className="space-y-0.5">
              {openDeals
                .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
                .slice(0, 8)
                .map(deal => (
                  <div key={deal.id} className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <Link to={`/opportunity/${deal.id}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                        {deal.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {deal.account_name} · {deal.owner_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-sm sgd-value font-semibold">{formatSGD(deal.value ?? 0)}</span>
                      <p className="text-[10px] text-muted-foreground">{Math.round((deal.win_probability ?? 0) * 100)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="data-panel">
          <div className="flex items-center justify-between mb-3">
            <h2 className="consulting-headline">Recent Activity</h2>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-0.5">
            {recentActivities.map(act => {
              const user = getUserById(act.created_by_user_id);
              return (
                <div key={act.id} className="flex gap-2.5 py-2 px-2.5 rounded hover:bg-muted/30 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-muted-foreground"> · {act.activity_type}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{act.summary}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(act.activity_date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
