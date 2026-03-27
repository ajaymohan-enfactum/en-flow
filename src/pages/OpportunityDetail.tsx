import { useParams, Link } from 'react-router-dom';
import { useDeal } from '@/hooks/useDeals';
import { formatSGD, formatDate } from '@/lib/format';
import { StageBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading } = useDeal(id);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <Link to="/pipeline" className="text-primary hover:underline text-sm">← Back to Pipeline</Link>
        <p className="mt-2">Deal not found.</p>
      </div>
    );
  }

  const weighted = (deal.value ?? 0) * (deal.win_probability ?? 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-fade-in">
      <Link to="/pipeline" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />Pipeline
      </Link>

      {/* Header card */}
      <div className="data-panel header-stripe">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold">{deal.title}</h1>
            <p className="text-xs text-muted-foreground">
              {deal.account_id && (
                <Link to={`/accounts/${deal.account_id}`} className="text-primary hover:underline">{deal.account_name}</Link>
              )}
              {deal.industry && ` · ${deal.industry}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <StageBadge stage={deal.stage || 'Prospect'} />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4 pt-4 border-t border-border/40">
          {[
            { label: 'Value', value: formatSGD(deal.value ?? 0), mono: true },
            { label: 'Win Probability', value: `${Math.round((deal.win_probability ?? 0) * 100)}%` },
            { label: 'Weighted', value: formatSGD(weighted), mono: true },
            { label: 'Owner', value: deal.owner_name || '—' },
            { label: 'GP%', value: deal.gp_percent != null ? `${deal.gp_percent.toFixed(1)}%` : '—' },
            { label: 'Expected Close', value: deal.expected_close_date || '—' },
          ].map(item => (
            <div key={item.label}>
              <p className="section-label">{item.label}</p>
              <p className={`text-sm font-semibold mt-0.5 ${item.mono ? 'sgd-value' : ''}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="margin">Margin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          {deal.description && (
            <div className="data-panel">
              <h3 className="consulting-headline mb-1.5">Description</h3>
              <p className="text-sm leading-relaxed text-foreground/80">{deal.description}</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="data-panel">
              <h3 className="consulting-headline mb-1.5">Details</h3>
              <div className="space-y-1.5 text-sm">
                <div><span className="text-muted-foreground">Currency:</span> {deal.currency || 'SGD'}</div>
                <div><span className="text-muted-foreground">MDF Eligible:</span> {deal.mdf_eligible ? 'Yes' : 'No'}</div>
                {deal.mdf_amount && <div><span className="text-muted-foreground">MDF Amount:</span> {formatSGD(deal.mdf_amount)}</div>}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="margin" className="space-y-3 mt-3">
          <div className="data-panel">
            <h3 className="consulting-headline mb-3">Margin Analysis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="section-label">Revenue</p><p className="sgd-value font-semibold mt-0.5">{formatSGD(deal.revenue ?? 0)}</p></div>
              <div><p className="section-label">Cost of Goods</p><p className="sgd-value font-semibold mt-0.5">{formatSGD(deal.cost_of_goods ?? 0)}</p></div>
              <div><p className="section-label">Cost of Services</p><p className="sgd-value font-semibold mt-0.5">{formatSGD(deal.cost_of_services ?? 0)}</p></div>
              <div><p className="section-label">MDF Subsidy</p><p className="sgd-value font-semibold mt-0.5">{formatSGD(deal.mdf_subsidy ?? 0)}</p></div>
              <div><p className="section-label">Gross Profit</p><p className="sgd-value font-semibold mt-0.5">{formatSGD(deal.gross_profit ?? 0)}</p></div>
              <div><p className="section-label">GP %</p><p className="font-semibold mt-0.5">{deal.gp_percent != null ? `${deal.gp_percent.toFixed(1)}%` : '—'}</p></div>
              <div><p className="section-label">Approved</p>
                <Badge variant={deal.margin_approved ? 'success' : 'secondary'} className="text-[10px] mt-0.5">
                  {deal.margin_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
