import { useMemo } from 'react';
import { KPICard } from '@/components/KPICard';
import { StageBadge } from '@/components/StatusBadges';
import { formatSGD } from '@/lib/format';
import { useDeals } from '@/hooks/useDeals';
import { STAGES_ORDERED } from '@/types';
import { DollarSign, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reports() {
  const { data: deals = [], isLoading } = useDeals();

  const openDeals = useMemo(() => deals.filter(d => d.stage && !['Closed', 'Lost', 'Won'].includes(d.stage)), [deals]);
  const totalPipeline = openDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const weightedPipeline = openDeals.reduce((s, d) => s + (d.value ?? 0) * (d.win_probability ?? 0), 0);

  const wonDeals = deals.filter(d => d.stage === 'Closed' || d.stage === 'Won');
  const lostDeals = deals.filter(d => d.stage === 'Lost');

  const pipelineByStage = useMemo(() => {
    return STAGES_ORDERED.filter(s => !['Closed', 'Lost'].includes(s)).map(stage => {
      const stageDeals = openDeals.filter(d => d.stage === stage);
      return { stage, count: stageDeals.length, value: stageDeals.reduce((s, d) => s + (d.value ?? 0), 0) };
    });
  }, [openDeals]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Executive Summary</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Board-ready pipeline overview · Enfactum Funnel Manager</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total Pipeline" value={formatSGD(totalPipeline)} icon={DollarSign} accent />
        <KPICard label="Weighted Pipeline" value={formatSGD(weightedPipeline)} icon={TrendingUp} accent />
        <KPICard label="Open Deals" value={openDeals.length} icon={Target} accent />
        <KPICard label="Total Deals" value={deals.length} icon={AlertTriangle} />
      </div>

      <div className="data-panel">
        <h2 className="consulting-headline mb-4">Pipeline by Stage</h2>
        <div className="space-y-2.5">
          {pipelineByStage.map(s => {
            const pct = totalPipeline > 0 ? (s.value / totalPipeline) * 100 : 0;
            return (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-36 flex-shrink-0"><StageBadge stage={s.stage} /></div>
                <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div className="h-full rounded bg-primary/60 transition-all duration-500" style={{ width: `${Math.max(pct, 1.5)}%` }} />
                </div>
                <div className="w-24 text-right sgd-value text-xs">{formatSGD(s.value)}</div>
                <div className="w-12 text-right text-[11px] text-muted-foreground">{s.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="data-panel">
          <h2 className="consulting-headline mb-3">Top 5 Deals</h2>
          <table className="w-full table-compact">
            <thead><tr><th className="text-left">Deal</th><th className="text-right">Value</th><th className="text-right">Win%</th></tr></thead>
            <tbody>
              {openDeals
                .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
                .slice(0, 5)
                .map(d => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/opportunity/${d.id}`} className="text-primary hover:underline text-sm">{d.title}</Link>
                      <p className="text-[10px] text-muted-foreground">{d.account_name}</p>
                    </td>
                    <td className="text-right sgd-value text-sm">{formatSGD(d.value ?? 0)}</td>
                    <td className="text-right text-muted-foreground font-mono text-sm">{Math.round((d.win_probability ?? 0) * 100)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="data-panel">
          <h2 className="consulting-headline mb-3">Win / Loss</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 rounded bg-success/10 border border-success/20">
              <p className="text-2xl font-bold text-success">{wonDeals.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Won</p>
              <p className="text-xs sgd-value font-semibold mt-0.5">{formatSGD(wonDeals.reduce((s, d) => s + (d.value ?? 0), 0))}</p>
            </div>
            <div className="text-center p-4 rounded bg-destructive/10 border border-destructive/20">
              <p className="text-2xl font-bold text-destructive">{lostDeals.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Lost</p>
              <p className="text-xs sgd-value font-semibold mt-0.5">{formatSGD(lostDeals.reduce((s, d) => s + (d.value ?? 0), 0))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
