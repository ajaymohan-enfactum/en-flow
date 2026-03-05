import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FollowupBadge, ConfidenceBadge, StageBadge, StuckBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent } from '@/lib/format';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageHistory, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { STAGES_ORDERED, Stage, Opportunity, getEffectiveProbability, getWeightedValue, getFollowupStatus, getConfidenceScore, getStageAgeDays } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, Table as TableIcon, Search, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';

type ViewMode = 'kanban' | 'table';

function enrichOpp(opp: Opportunity) {
  return {
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
  };
}

export default function Pipeline() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => [...mockOpportunities]);

  const enrichedOpps = useMemo(() => opportunities.map(enrichOpp), [opportunities]);

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

  const handleStageChange = useCallback((oppId: string, newStage: Stage) => {
    setOpportunities(prev => prev.map(opp => {
      if (opp.id !== oppId) return opp;
      const rule = getStageRule(newStage);
      const newProb = rule?.default_probability ?? opp.probability_system;
      return {
        ...opp,
        stage: newStage,
        probability_system: newProb,
        probability_override: undefined,
        probability_override_reason: undefined,
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

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

      {viewMode === 'kanban' ? <KanbanView opps={filtered} onStageChange={handleStageChange} /> : <PipelineTable opps={filtered} />}
    </div>
  );
}

/* ─── Kanban with Drag & Drop ─── */

function KanbanView({ opps, onStageChange }: { opps: any[]; onStageChange: (oppId: string, newStage: Stage) => void }) {
  const kanbanStages = STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeOpp = activeId ? opps.find(o => o.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const oppId = active.id as string;
    const opp = opps.find(o => o.id === oppId);
    if (!opp) return;

    // The over target is either a column id (stage name) or another card
    let targetStage: Stage | undefined;

    // Check if dropped over a column
    if (kanbanStages.includes(over.id as Stage)) {
      targetStage = over.id as Stage;
    } else {
      // Dropped over another card — find which stage that card is in
      const overOpp = opps.find(o => o.id === over.id);
      if (overOpp) targetStage = overOpp.stage;
    }

    if (targetStage && targetStage !== opp.stage) {
      const rule = getStageRule(targetStage);
      onStageChange(oppId, targetStage);
      toast.success(`Moved "${opp.opportunity_title}" to ${targetStage}`, {
        description: rule ? `Probability updated to ${(rule.default_probability * 100).toFixed(0)}%` : undefined,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {kanbanStages.map(stage => {
          const stageOpps = opps.filter((o: any) => o.stage === stage);
          return (
            <KanbanColumn key={stage} stage={stage} opps={stageOpps} />
          );
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeOpp ? <KanbanCardContent opp={activeOpp} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ stage, opps }: { stage: Stage; opps: any[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = opps.reduce((s: number, o: any) => s + o.est_value_sgd, 0);
  const oppIds = opps.map(o => o.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column transition-all duration-200',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
        <div>
          <div className="flex items-center gap-1.5">
            <StageBadge stage={stage} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{opps.length} deals · {formatSGD(totalValue)}</p>
        </div>
      </div>
      <SortableContext items={oppIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[60px]">
          {opps.map((opp: any) => (
            <SortableKanbanCard key={opp.id} opp={opp} />
          ))}
          {opps.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-8 opacity-50">Drop deals here</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableKanbanCard({ opp }: { opp: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <KanbanCardContent opp={opp} dragListeners={listeners} />
    </div>
  );
}

function KanbanCardContent({ opp, isDragging, dragListeners }: { opp: any; isDragging?: boolean; dragListeners?: any }) {
  return (
    <div className={cn('kanban-card group', isDragging && 'ring-2 ring-primary shadow-lg shadow-primary/20 rotate-1')}>
      <div className="flex items-start gap-1.5">
        <button
          className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0 text-muted-foreground"
          {...dragListeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link to={`/opportunity/${opp.id}`} className="text-sm font-medium leading-tight hover:text-primary transition-colors" onClick={e => isDragging && e.preventDefault()}>
              {opp.opportunity_title}
            </Link>
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
      </div>
    </div>
  );
}

/* ─── Table View ─── */

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
