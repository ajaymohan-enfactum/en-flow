import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FollowupBadge, ConfidenceBadge, StageBadge, StuckBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent, formatDate } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageHistory, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { STAGES_ORDERED, getEffectiveProbability, getWeightedValue, getFollowupStatus, getConfidenceScore, getStageAgeDays } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, Table as TableIcon, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'table';

export default function Pipeline() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const enrichedOpps = useMemo(() => {
    return mockOpportunities.map(opp => ({
      ...opp,
      account: getAccountById(opp.account_id),
      owner: getUserById(opp.opportunity_owner_user_id),
      relOwner: opp.relationship_owner_user_id ? getUserById(opp.relationship_owner_user_id) : undefined,
      effectiveProb: getEffectiveProbability(opp),
      weightedEffective: getWeightedValue(opp),
      followup: getFollowupStatus(mockTasks, opp.id),
      confidence: getConfidenceScore(opp, mockTasks, mockActivities, mockArtifacts, getStageRule(opp.stage)),
      stageAge: getStageAgeDays(opp, mockStageHistory),
      stageRule: getStageRule(opp.stage),
      nextTask: mockTasks.filter(t => t.opportunity_id === opp.id && t.status === 'Open').sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0],
    }));
  }, []);

  const filtered = useMemo(() => {
    let result = enrichedOpps;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.opportunity_title.toLowerCase().includes(q) ||
        o.account?.account_name.toLowerCase().includes(q) ||
        o.owner?.name.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'all') {
      result = result.filter(o => o.stage === stageFilter);
    }
    return result;
  }, [enrichedOpps, search, stageFilter]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pipeline</h1>
        <Button size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" />Add Opportunity</Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm bg-card" />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-card px-2.5 text-xs"
        >
          <option value="all">All stages</option>
          {STAGES_ORDERED.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex border border-input rounded-md overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn('px-2.5 py-1.5 text-xs flex items-center gap-1 transition-colors',
              viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
            )}
          >
            <LayoutGrid className="h-3 w-3" />Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn('px-2.5 py-1.5 text-xs flex items-center gap-1 transition-colors',
              viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
            )}
          >
            <TableIcon className="h-3 w-3" />Table
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanView opps={filtered} /> : <PipelineTable opps={filtered} />}
    </div>
  );
}

function KanbanView({ opps }: { opps: any[] }) {
  const kanbanStages = STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s));

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {kanbanStages.map(stage => {
        const stageOpps = opps.filter((o: any) => o.stage === stage);
        const totalValue = stageOpps.reduce((s: number, o: any) => s + o.est_value_sgd, 0);
        return (
          <div key={stage} className="kanban-column">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
              <div>
                <div className="flex items-center gap-1.5">
                  <StageBadge stage={stage} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stageOpps.length} deals · {formatSGD(totalValue)}</p>
              </div>
            </div>
            <div className="space-y-2">
              {stageOpps.map((opp: any) => (
                <Link key={opp.id} to={`/opportunity/${opp.id}`} className="block">
                  <div className="kanban-card">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium leading-tight">{opp.opportunity_title}</p>
                      <ConfidenceBadge score={opp.confidence} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{opp.account?.account_name}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold sgd-value">{formatSGD(opp.est_value_sgd)}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{formatPercent(opp.effectiveProb)}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <FollowupBadge status={opp.followup} />
                      {opp.stageRule && <StuckBadge stageAgeDays={opp.stageAge} slaDays={opp.stageRule.sla_days_in_stage} />}
                    </div>
                    {opp.nextTask && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 truncate">
                        → {opp.nextTask.title}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{opp.owner?.name}</p>
                  </div>
                </Link>
              ))}
              {stageOpps.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-8 opacity-50">No deals</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PipelineTable({ opps }: { opps: any[] }) {
  return (
    <div className="data-panel overflow-x-auto p-0">
      <table className="w-full table-compact">
        <thead>
          <tr>
            <th className="text-left">Account</th>
            <th className="text-left">Opportunity</th>
            <th className="text-left">Stage</th>
            <th className="text-left">Owner</th>
            <th className="text-left">Country</th>
            <th className="text-right">Value (SGD)</th>
            <th className="text-right">Prob (Sys)</th>
            <th className="text-right">Prob (Eff)</th>
            <th className="text-right">Weighted</th>
            <th className="text-center">Conf</th>
            <th className="text-center">Age</th>
            <th className="text-left">Next Task</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {opps.map((o: any) => (
            <tr key={o.id}>
              <td className="font-medium">{o.account?.account_name}</td>
              <td>
                <Link to={`/opportunity/${o.id}`} className="text-primary hover:underline">{o.opportunity_title}</Link>
              </td>
              <td><StageBadge stage={o.stage} /></td>
              <td className="text-muted-foreground">{o.owner?.name}</td>
              <td className="text-muted-foreground">{o.country}</td>
              <td className="text-right sgd-value">{formatSGD(o.est_value_sgd)}</td>
              <td className="text-right font-mono text-muted-foreground">{formatPercent(o.probability_system)}</td>
              <td className="text-right font-mono">{formatPercent(o.effectiveProb)}</td>
              <td className="text-right sgd-value">{formatSGD(o.weightedEffective)}</td>
              <td className="text-center"><ConfidenceBadge score={o.confidence} /></td>
              <td className="text-center text-muted-foreground font-mono">{o.stageAge}d</td>
              <td className="text-[11px] text-muted-foreground max-w-[120px] truncate">{o.nextTask?.title || '—'}</td>
              <td className="text-center"><FollowupBadge status={o.followup} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
