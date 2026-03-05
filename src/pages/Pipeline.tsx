import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FollowupBadge, ConfidenceBadge, StageBadge, StuckBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent, formatDate } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageRules, mockStageHistory, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { STAGES_ORDERED, getEffectiveProbability, getWeightedValue, getFollowupStatus, getConfidenceScore, getStageAgeDays, Stage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Table as TableIcon, Search, Plus, Filter } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <div className="flex items-center gap-2">
          <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Add Opportunity</Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All stages</option>
          {STAGES_ORDERED.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex border rounded-md overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn('px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors', viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn('px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors', viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <TableIcon className="h-3.5 w-3.5" />Table
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanView opps={filtered} />
      ) : (
        <TableView opps={filtered} />
      )}
    </div>
  );
}

function KanbanView({ opps }: { opps: ReturnType<typeof enrichOpp>[] }) {
  const kanbanStages = STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {kanbanStages.map(stage => {
        const stageOpps = opps.filter(o => o.stage === stage);
        const totalValue = stageOpps.reduce((s, o) => s + o.est_value_sgd, 0);
        return (
          <div key={stage} className="kanban-column">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">{stage}</h3>
                <p className="text-xs text-muted-foreground">{stageOpps.length} · {formatSGD(totalValue)}</p>
              </div>
            </div>
            <div className="space-y-2">
              {stageOpps.map(opp => (
                <Link key={opp.id} to={`/opportunity/${opp.id}`} className="block">
                  <div className="kanban-card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-tight">{opp.opportunity_title}</p>
                      <ConfidenceBadge score={opp.confidence} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{opp.account?.account_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold sgd-value">{formatSGD(opp.est_value_sgd)}</span>
                      <span className="text-xs text-muted-foreground">{formatPercent(opp.effectiveProb)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <FollowupBadge status={opp.followup} />
                      {opp.stageRule && <StuckBadge stageAgeDays={opp.stageAge} slaDays={opp.stageRule.sla_days_in_stage} />}
                    </div>
                    {opp.nextTask && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        Next: {opp.nextTask.title} · {formatDate(opp.nextTask.due_date)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{opp.owner?.name}</p>
                  </div>
                </Link>
              ))}
              {stageOpps.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No opportunities</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EnrichedOpp = ReturnType<typeof useEnrichedData>[number];
function enrichOpp() { return null as any; } // type placeholder

function TableView({ opps }: { opps: any[] }) {
  return (
    <div className="bg-card rounded-lg border overflow-x-auto">
      <table className="w-full table-compact">
        <thead>
          <tr className="border-b">
            <th className="text-left">Account</th>
            <th className="text-left">Opportunity</th>
            <th className="text-left">Stage</th>
            <th className="text-left">Owner</th>
            <th className="text-left">Country</th>
            <th className="text-left">Workstream</th>
            <th className="text-right">Value (SGD)</th>
            <th className="text-right">Prob (Sys)</th>
            <th className="text-right">Prob (Eff)</th>
            <th className="text-right">Weighted</th>
            <th className="text-center">Confidence</th>
            <th className="text-center">Stage Age</th>
            <th className="text-left">Next Task</th>
            <th className="text-center">Follow-up</th>
          </tr>
        </thead>
        <tbody>
          {opps.map(o => (
            <tr key={o.id} className="hover:bg-muted/30 transition-colors">
              <td className="font-medium">{o.account?.account_name}</td>
              <td>
                <Link to={`/opportunity/${o.id}`} className="text-primary hover:underline">
                  {o.opportunity_title}
                </Link>
              </td>
              <td><StageBadge stage={o.stage} /></td>
              <td className="text-muted-foreground">{o.owner?.name}</td>
              <td className="text-muted-foreground">{o.country}</td>
              <td className="text-muted-foreground">{o.workstream}</td>
              <td className="text-right sgd-value">{formatSGD(o.est_value_sgd)}</td>
              <td className="text-right">{formatPercent(o.probability_system)}</td>
              <td className="text-right">{formatPercent(o.effectiveProb)}</td>
              <td className="text-right sgd-value">{formatSGD(o.weightedEffective)}</td>
              <td className="text-center"><ConfidenceBadge score={o.confidence} /></td>
              <td className="text-center">{o.stageAge}d</td>
              <td className="text-xs text-muted-foreground max-w-[150px] truncate">{o.nextTask?.title || '—'}</td>
              <td className="text-center"><FollowupBadge status={o.followup} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useEnrichedData() { return []; }
