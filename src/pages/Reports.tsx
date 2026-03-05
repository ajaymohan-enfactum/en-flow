import { useMemo } from 'react';
import { KPICard } from '@/components/KPICard';
import { StageBadge, ConfidenceBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent, formatDate } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageHistory, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { STAGES_ORDERED, getWeightedValue, getConfidenceScore, getStageAgeDays } from '@/types';
import { DollarSign, TrendingUp, Target, AlertTriangle } from 'lucide-react';
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
      return { stage, count: stageOpps.length, value: stageOpps.reduce((s, o) => s + o.est_value_sgd, 0), weighted: stageOpps.reduce((s, o) => s + getWeightedValue(o), 0) };
    });
  }, [openOpps]);

  const overdueTasks = mockTasks.filter(t => t.status === 'Open' && new Date(t.due_date) < new Date());
  const closedDeals = mockOpportunities.filter(o => o.stage === 'Closed');
  const lostDeals = mockOpportunities.filter(o => o.stage === 'Lost');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Executive Summary</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Board-ready pipeline overview · Enfactum Funnel Manager</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total Pipeline" value={formatSGD(totalPipeline)} icon={DollarSign} accent />
        <KPICard label="Weighted (System)" value={formatSGD(weightedSystem)} icon={TrendingUp} accent />
        <KPICard label="Weighted (Effective)" value={formatSGD(weightedEffective)} icon={Target} accent />
        <KPICard label="Stuck > SLA" value={stuckOpps.length} subtitle="deals past stage SLA" icon={AlertTriangle} />
      </div>

      {/* Pipeline by Stage — horizontal bar chart */}
      <div className="data-panel">
        <h2 className="consulting-headline mb-4">Pipeline by Stage</h2>
        <div className="space-y-2.5">
          {pipelineByStage.map(s => {
            const pct = totalPipeline > 0 ? (s.value / totalPipeline) * 100 : 0;
            return (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-36 flex-shrink-0"><StageBadge stage={s.stage} /></div>
                <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full rounded bg-primary/60 transition-all duration-500"
                    style={{ width: `${Math.max(pct, 1.5)}%` }}
                  />
                </div>
                <div className="w-24 text-right sgd-value text-xs">{formatSGD(s.value)}</div>
                <div className="w-12 text-right text-[11px] text-muted-foreground">{s.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Deals */}
        <div className="data-panel">
          <h2 className="consulting-headline mb-3">Top 5 Deals to Watch</h2>
          <table className="w-full table-compact">
            <thead><tr><th className="text-left">Opportunity</th><th className="text-right">Value</th><th className="text-center">Conf</th></tr></thead>
            <tbody>
              {openOpps
                .map(o => ({ ...o, confidence: getConfidenceScore(o, mockTasks, mockActivities, mockArtifacts, getStageRule(o.stage)), account: getAccountById(o.account_id) }))
                .sort((a, b) => b.est_value_sgd - a.est_value_sgd)
                .slice(0, 5)
                .map(o => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/opportunity/${o.id}`} className="text-primary hover:underline text-sm">{o.opportunity_title}</Link>
                      <p className="text-[10px] text-muted-foreground">{o.account?.account_name}</p>
                    </td>
                    <td className="text-right sgd-value text-sm">{formatSGD(o.est_value_sgd)}</td>
                    <td className="text-center"><ConfidenceBadge score={o.confidence} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Win/Loss */}
        <div className="data-panel">
          <h2 className="consulting-headline mb-3">Win / Loss</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-4 rounded bg-success/10 border border-success/20">
              <p className="text-2xl font-bold text-success">{closedDeals.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Won</p>
              <p className="text-xs sgd-value font-semibold mt-0.5">{formatSGD(closedDeals.reduce((s, o) => s + o.est_value_sgd, 0))}</p>
            </div>
            <div className="text-center p-4 rounded bg-destructive/10 border border-destructive/20">
              <p className="text-2xl font-bold text-destructive">{lostDeals.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Lost</p>
              <p className="text-xs sgd-value font-semibold mt-0.5">{formatSGD(lostDeals.reduce((s, o) => s + o.est_value_sgd, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue */}
      <div className="data-panel">
        <h2 className="consulting-headline mb-3">Overdue Tasks</h2>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No overdue tasks. 🎉</p>
        ) : (
          <table className="w-full table-compact">
            <thead><tr><th className="text-left">Task</th><th className="text-left">Owner</th><th className="text-left">Due</th><th className="text-left">Opportunity</th></tr></thead>
            <tbody>
              {overdueTasks.map(t => {
                const opp = mockOpportunities.find(o => o.id === t.opportunity_id);
                return (
                  <tr key={t.id}>
                    <td className="font-medium">{t.title}</td>
                    <td className="text-muted-foreground">{getUserById(t.owner_user_id)?.name}</td>
                    <td className="text-destructive font-mono text-xs">{formatDate(t.due_date)}</td>
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
