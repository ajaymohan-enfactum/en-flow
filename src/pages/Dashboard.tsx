import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { KPICard } from '@/components/KPICard';
import { FollowupBadge, StageBadge } from '@/components/StatusBadges';
import { formatSGD, formatDate } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, getUserById, getAccountById } from '@/data/mockData';
import { getEffectiveProbability, getWeightedValue, getFollowupStatus, getConfidenceScore } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign, TrendingUp, Target, AlertTriangle, CheckCircle, Clock,
  Plus, FileText, ListTodo, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const openOpps = useMemo(() => mockOpportunities.filter(o => !['Closed', 'Lost'].includes(o.stage)), []);
  const totalPipeline = useMemo(() => openOpps.reduce((s, o) => s + o.est_value_sgd, 0), [openOpps]);
  const weightedSystem = useMemo(() => openOpps.reduce((s, o) => s + o.est_value_sgd * o.probability_system, 0), [openOpps]);
  const weightedEffective = useMemo(() => openOpps.reduce((s, o) => s + getWeightedValue(o), 0), [openOpps]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return mockTasks.filter(t => t.status === 'Open' && t.due_date && new Date(t.due_date) < now);
  }, []);

  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return mockTasks.filter(t => t.status === 'Open' && t.due_date && new Date(t.due_date) >= now && new Date(t.due_date) <= week);
  }, []);

  const myTasks = useMemo(() => {
    return mockTasks
      .filter(t => t.owner_user_id === currentUser.id && t.status === 'Open')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [currentUser.id]);

  const recentActivities = useMemo(() => {
    return [...mockActivities].sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()).slice(0, 6);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <span className="text-xs text-muted-foreground">Funnel Manager</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {currentUser.name}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" />Opportunity</Button>
          <Button size="sm" variant="secondary" className="h-8 text-xs"><ListTodo className="h-3 w-3 mr-1" />Task</Button>
        </div>
      </div>

      {/* KPI Cards — blue top stripe on first 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard label="Total Pipeline" value={formatSGD(totalPipeline)} icon={DollarSign} accent />
        <KPICard label="Weighted (System)" value={formatSGD(weightedSystem)} icon={TrendingUp} accent />
        <KPICard label="Weighted (Effective)" value={formatSGD(weightedEffective)} icon={Target} accent />
        <KPICard label="Open Opps" value={openOpps.length} icon={FileText} />
        <KPICard label="Overdue Tasks" value={overdueTasks.length} icon={AlertTriangle} />
        <KPICard label="Due Next 7d" value={dueSoonTasks.length} icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* My Tasks */}
        <div className="data-panel">
          <div className="flex items-center justify-between mb-3">
            <h2 className="consulting-headline">My Tasks</h2>
            <Badge variant="outline" className="text-[10px]">{myTasks.length} open</Badge>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No open tasks.</p>
          ) : (
            <div className="space-y-0.5">
              {myTasks.slice(0, 8).map(task => {
                const opp = mockOpportunities.find(o => o.id === task.opportunity_id);
                const account = opp ? getAccountById(opp.account_id) : undefined;
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div key={task.id} className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 cursor-pointer group-hover:text-success transition-colors" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {account?.account_name} · {opp?.opportunity_title}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono flex-shrink-0 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                );
              })}
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
              const opp = mockOpportunities.find(o => o.id === act.opportunity_id);
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
                      {opp?.opportunity_title} · {formatDate(act.activity_date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Most Stuck Deals */}
      <div className="data-panel">
        <h2 className="consulting-headline mb-3">Deals Requiring Attention</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-compact">
            <thead>
              <tr>
                <th className="text-left">Account</th>
                <th className="text-left">Opportunity</th>
                <th className="text-left">Stage</th>
                <th className="text-right">Value (SGD)</th>
                <th className="text-left">Owner</th>
                <th className="text-center">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {openOpps
                .map(o => ({
                  ...o,
                  followup: getFollowupStatus(mockTasks, o.id),
                  account: getAccountById(o.account_id),
                  owner: getUserById(o.opportunity_owner_user_id),
                }))
                .filter(o => o.followup === 'Overdue' || o.followup === 'Due Soon')
                .slice(0, 5)
                .map(o => (
                  <tr key={o.id}>
                    <td className="font-medium text-sm">{o.account?.account_name}</td>
                    <td>
                      <Link to={`/opportunity/${o.id}`} className="text-primary hover:underline text-sm">
                        {o.opportunity_title}
                      </Link>
                    </td>
                    <td><StageBadge stage={o.stage} /></td>
                    <td className="text-right sgd-value text-sm">{formatSGD(o.est_value_sgd)}</td>
                    <td className="text-muted-foreground text-sm">{o.owner?.name}</td>
                    <td className="text-center"><FollowupBadge status={o.followup} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
