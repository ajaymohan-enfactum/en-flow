import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FollowupBadge, ConfidenceBadge, StageBadge, StuckBadge } from '@/components/StatusBadges';
import { formatSGD, formatPercent } from '@/lib/format';
import { useDeals, useUpdateDeal } from '@/hooks/useDeals';
import { STAGES_ORDERED, Stage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';
import type { DbVDeal } from '@/integrations/supabase/db';

type ViewMode = 'kanban' | 'table';

export default function Pipeline() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const { data: deals = [], isLoading } = useDeals();
  const updateDeal = useUpdateDeal();

  const filtered = useMemo(() => {
    let result = deals;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.account_name?.toLowerCase().includes(q) ||
        o.owner_name?.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'all') {
      result = result.filter(o => o.stage === stageFilter);
    }
    return result;
  }, [deals, search, stageFilter]);

  const handleStageChange = useCallback((dealId: string, newStage: Stage) => {
    updateDeal.mutate(
      { id: dealId, updates: { stage: newStage } },
      {
        onSuccess: () => {
          const deal = deals.find(d => d.id === dealId);
          toast.success(`Moved "${deal?.title}" to ${newStage}`);
        },
        onError: (err) => {
          toast.error('Failed to update stage: ' + (err as Error).message);
        },
      }
    );
  }, [deals, updateDeal]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

      {viewMode === 'kanban' ? <KanbanView deals={filtered} onStageChange={handleStageChange} /> : <PipelineTable deals={filtered} />}
    </div>
  );
}

/* ─── Kanban with Drag & Drop ─── */

function KanbanView({ deals, onStageChange }: { deals: DbVDeal[]; onStageChange: (dealId: string, newStage: Stage) => void }) {
  const kanbanStages = STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    let targetStage: Stage | undefined;
    if (kanbanStages.includes(over.id as Stage)) {
      targetStage = over.id as Stage;
    } else {
      const overDeal = deals.find(d => d.id === over.id);
      if (overDeal) targetStage = overDeal.stage as Stage;
    }

    if (targetStage && targetStage !== deal.stage) {
      onStageChange(dealId, targetStage);
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
          const stageDeals = deals.filter(d => d.stage === stage);
          return <KanbanColumn key={stage} stage={stage} deals={stageDeals} />;
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeDeal ? <KanbanCardContent deal={activeDeal} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ stage, deals }: { stage: Stage; deals: DbVDeal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = deals.reduce((s, d) => s + (d.value ?? 0), 0);
  const dealIds = deals.map(d => d.id);

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
          <StageBadge stage={stage} />
          <p className="text-[11px] text-muted-foreground mt-1">{deals.length} deals · {formatSGD(totalValue)}</p>
        </div>
      </div>
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[60px]">
          {deals.map(deal => (
            <SortableKanbanCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-8 opacity-50">Drop deals here</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableKanbanCard({ deal }: { deal: DbVDeal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <KanbanCardContent deal={deal} dragListeners={listeners} />
    </div>
  );
}

function MarginIndicator({ deal }: { deal: DbVDeal }) {
  const gp = deal.margin_gp_percent ?? deal.gp_percent;
  const hasMargin = gp != null || deal.margin_revenue != null || deal.revenue != null;

  if (!hasMargin) {
    return (
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/20">
        <span className="text-[10px] text-muted-foreground">No margin data</span>
        <Link to={`/opportunity/${deal.id}`} className="text-[10px] text-primary hover:underline" onClick={e => e.stopPropagation()}>
          Add margin →
        </Link>
      </div>
    );
  }

  const gpValue = gp ?? 0;
  const variant = gpValue >= 20 ? 'success' : gpValue >= 12 ? 'warning' : 'destructive';
  const approved = deal.margin_approved;

  return (
    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/20">
      <Badge variant={variant} className="text-[10px] px-1.5 py-0 font-mono">
        GP: {gpValue.toFixed(1)}%
      </Badge>
      {approved === false && (
        <span className="text-[10px] text-warning">⏳ Pending</span>
      )}
      {approved === true && (
        <span className="text-[10px] text-success">✓ Approved</span>
      )}
    </div>
  );
}

function MdfBadge({ deal }: { deal: DbVDeal }) {
  if (!deal.mdf_eligible) return null;
  const estAmount = deal.mdf_amount ? formatSGD(deal.mdf_amount) : 'TBD';
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-400 bg-amber-500/10">
            🏷️ MDF
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          HP/Lenovo MDF eligible — est. {estAmount}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function KanbanCardContent({ deal, isDragging, dragListeners }: { deal: DbVDeal; isDragging?: boolean; dragListeners?: any }) {
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/opportunity/${deal.id}`} className="text-sm font-medium leading-tight hover:text-primary transition-colors" onClick={e => isDragging && e.preventDefault()}>
              {deal.title}
            </Link>
            <MdfBadge deal={deal} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">{deal.account_name}</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold sgd-value">{formatSGD(deal.value ?? 0)}</span>
            <span className="text-[11px] text-muted-foreground font-mono">{Math.round((deal.win_probability ?? 0) * 100)}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{deal.owner_name}</p>
          <MarginIndicator deal={deal} />
        </div>
      </div>
    </div>
  );
}

/* ─── Table View ─── */

function PipelineTable({ deals }: { deals: DbVDeal[] }) {
  return (
    <div className="data-panel overflow-x-auto p-0">
      <table className="w-full table-compact">
        <thead>
          <tr>
            <th className="text-left">Account</th>
            <th className="text-left">Deal</th>
            <th className="text-left">Stage</th>
            <th className="text-left">Owner</th>
            <th className="text-right">Value</th>
            <th className="text-right">Win Prob</th>
            <th className="text-right">Weighted</th>
            <th className="text-right">GP%</th>
            <th className="text-center">MDF</th>
            <th className="text-left">Expected Close</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(d => (
            <tr key={d.id}>
              <td className="font-medium">{d.account_name}</td>
              <td>
                <Link to={`/opportunity/${d.id}`} className="text-primary hover:underline">{d.title}</Link>
              </td>
              <td><StageBadge stage={(d.stage as Stage) || 'Prospect'} /></td>
              <td className="text-muted-foreground">{d.owner_name}</td>
              <td className="text-right sgd-value">{formatSGD(d.value ?? 0)}</td>
              <td className="text-right font-mono text-muted-foreground">{Math.round((d.win_probability ?? 0) * 100)}%</td>
              <td className="text-right sgd-value">{formatSGD((d.value ?? 0) * (d.win_probability ?? 0))}</td>
              <td className="text-right font-mono text-muted-foreground">{d.gp_percent != null ? `${d.gp_percent.toFixed(1)}%` : '—'}</td>
              <td className="text-center">{d.mdf_eligible ? <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-400 bg-amber-500/10">🏷️ MDF</Badge> : '—'}</td>
              <td className="text-muted-foreground text-xs">{d.expected_close_date || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
