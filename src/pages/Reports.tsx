import { useMemo } from 'react';
import { KPICard } from '@/components/KPICard';
import { StageBadge, FollowupBadge, ConfidenceBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent, formatDate } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageHistory, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { STAGES_ORDERED, getWeightedValue, getFollowupStatus, getConfidenceScore, getStageAgeDays } from '@/types';
import { DollarSign, TrendingUp, Target, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reports() {
  const openOpps = useMemo(() => mockOpportunities.filter(o => !['Closed', 'Lost'].includes(o.stage)), []);
  const totalPipeline = openOpps.reduce((s, o) => s + o.est_value_sgd, 0);
  const weightedSystem = openOpps.reduce((s, o) => s + o.est_value_sgd * o.probability_system, 0);
  const weightedEffective = openOpps.reduce((s, o) => s + getWeightedValue(o), 0);

  const stuckOpps = useMemo(() => {
    return openOpps.map(o => {
      const stageAge = getStageAgeDays(o, mockStageHistory);
      const rule = getStageRule(o.stage);
      return { ...o, stageAge, rule, account: getAccountById(o.account_id), owner: getUserById(o.opportunity_owner_user_id) };
    }).filter(o => o.rule && o.stageAge > o.rule.sla_days_in_stage);
  }, [openOpps]);

  const pipelineByStage = useMemo(() => {
    return STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s)).map(stage => {
      const stageOpps = openOpps.filter(o => o.stage === stage);
      return {
        stage,
        count: stageOpps.length,
        value: stageOpps.reduce((s, o) => s + o.est_value_sgd, 0),
        weighted: stageOpps.reduce((s, o) => s + getWeightedValue(o), 0),
      };
    });
  }, [openOpps]);

  const overdueTasks = mockTasks.filter(t => t.status === 'Open' && new Date(t.due_date) < new Date());

  const closedDeals = mockOpportunities.filter(o => o.stage === 'Closed');
  const lostDeals = mockOpportunities.filter(o => o.stage === 'Lost');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Executive Summary</h1>
        <p className="text-sm text-muted-foreground">Board-ready pipeline overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Pipeline" value={formatSGD(totalPipeline)} icon={DollarSign} />
        <KPICard label="Weighted (System)" value={formatSGD(weightedSystem)} icon={TrendingUp} />
        <KPICard label="Weighted (Effective)" value={formatSGD(weightedEffective)} icon={Target} />
        <KPICard label="Stuck > SLA" value={stuckOpps.length} subtitle="deals past stage SLA" icon={AlertTriangle} />
      </div>

      {/* Pipeline by Stage */}
      <div className="bg-card rounded-lg border p-5">
        <h2 className="consulting-headline mb-4">Pipeline by Stage</h2>
        <div className="space-y-3">
          {pipelineByStage.map(s => {
            const pct = totalPipeline > 0 ? (s.value / totalPipeline) * 100 : 0;
            return (
              <div key={s.stage} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0"><StageBadge stage={s.stage} /></div>
                <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
                <div className="w-24 text-right sgd-value text-sm">{formatSGD(s.value)}</div>
                <div className="w-16 text-right text-xs text-muted-foreground">{s.count} deals</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Deals */}
        <div className="bg-card rounded-lg border p-5">
          <h2 className="consulting-headline mb-4">Top 5 Deals to Watch</h2>
          <table className="w-full table-compact">
            <thead><tr><th className="text-left">Opportunity</th><th className="text-right">Value</th><th className="text-center">Confidence</th></tr></thead>
            <tbody>
              {openOpps
                .map(o => ({ ...o, confidence: getConfidenceScore(o, mockTasks, mockActivities, mockArtifacts, getStageRule(o.stage)), account: getAccountById(o.account_id) }))
                .sort((a, b) => b.est_value_sgd - a.est_value_sgd)
                .slice(0, 5)
                .map(o => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td>
                      <Link to={`/opportunity/${o.id}`} className="text-primary hover:underline text-sm">{o.opportunity_title}</Link>
                      <p className="text-xs text-muted-foreground">{o.account?.account_name}</p>
                    </td>
                    <td className="text-right sgd-value">{formatSGD(o.est_value_sgd)}</td>
                    <td className="text-center"><ConfidenceBadge score={o.confidence} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Win/Loss */}
        <div className="bg-card rounded-lg border p-5">
          <h2 className="consulting-headline mb-4">Win / Loss Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-3xl font-bold text-success">{closedDeals.length}</p>
              <p className="text-sm text-muted-foreground">Won</p>
              <p className="text-sm sgd-value font-semibold">{formatSGD(closedDeals.reduce((s, o) => s + o.est_value_sgd, 0))}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-3xl font-bold text-destructive">{lostDeals.length}</p>
              <p className="text-sm text-muted-foreground">Lost</p>
              <p className="text-sm sgd-value font-semibold">{formatSGD(lostDeals.reduce((s, o) => s + o.est_value_sgd, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      <div className="bg-card rounded-lg border p-5">
        <h2 className="consulting-headline mb-4">Overdue Tasks by Owner</h2>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue tasks. 🎉</p>
        ) : (
          <table className="w-full table-compact">
            <thead><tr><th className="text-left">Task</th><th className="text-left">Owner</th><th className="text-left">Due</th><th className="text-left">Opportunity</th></tr></thead>
            <tbody>
              {overdueTasks.map(t => {
                const opp = mockOpportunities.find(o => o.id === t.opportunity_id);
                return (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="font-medium">{t.title}</td>
                    <td className="text-muted-foreground">{getUserById(t.owner_user_id)?.name}</td>
                    <td className="text-destructive">{formatDate(t.due_date)}</td>
                    <td><Link to={`/opportunity/${opp?.id}`} className="text-primary hover:underline text-sm">{opp?.opportunity_title}</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
