import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDeal } from '@/hooks/useDeals';
import { useEmployee } from '@/contexts/EmployeeContext';
import { db } from '@/integrations/supabase/db';
import { formatSGD } from '@/lib/format';
import { StageBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, DollarSign, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading } = useDeal(id);
  const { employee } = useEmployee();
  const queryClient = useQueryClient();

  // Margin form state
  const [showMarginForm, setShowMarginForm] = useState(false);
  const [marginForm, setMarginForm] = useState({
    revenue: '',
    cost_of_goods: '',
    cost_of_services: '',
    mdf_subsidy: '0',
    pricing_notes: '',
  });
  const [saving, setSaving] = useState(false);

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
  const hasMargin = deal.margin_revenue != null || deal.revenue != null;
  const gpPercent = deal.margin_gp_percent ?? deal.gp_percent;
  const gpVariant = gpPercent != null
    ? (gpPercent >= 20 ? 'success' : gpPercent >= 12 ? 'warning' : 'destructive')
    : 'secondary';

  const handleCreateMargin = async () => {
    const revenue = parseFloat(marginForm.revenue) || 0;
    const cogs = parseFloat(marginForm.cost_of_goods) || 0;
    const cos = parseFloat(marginForm.cost_of_services) || 0;
    const mdf = parseFloat(marginForm.mdf_subsidy) || 0;
    const grossProfit = revenue - cogs - cos + mdf;
    const gpPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    setSaving(true);

    try {
      // Insert margin record
      const { data: marginData, error: marginError } = await db
        .from('margins')
        .insert({
          deal_id: deal.id,
          revenue,
          cost_of_goods: cogs,
          cost_of_services: cos,
          mdf_subsidy: mdf,
          gross_profit: grossProfit,
          gp_percent: gpPct,
          approved: false,
        })
        .select()
        .single();

      if (marginError) throw marginError;

      // Log event
      await db.from('events').insert({
        module: 'enedge',
        entity_type: 'margin',
        entity_id: (marginData as any)?.id,
        event_type: 'margin.created',
        payload: {
          deal_id: deal.id,
          revenue,
          gp_percent: gpPct,
        },
        actor_id: employee?.id,
        occurred_at: new Date().toISOString(),
      });

      // Show warning if below floor
      if (gpPct < 15) {
        toast.warning(
          '⚠️ This deal is below the 15% margin floor. Consider reviewing pricing before advancing.',
          { duration: 6000 }
        );
      } else {
        toast.success('Margin record created');
      }

      setShowMarginForm(false);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    } catch (err: any) {
      toast.error('Failed to create margin: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

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
            {gpPercent != null && (
              <Badge variant={gpVariant as any} className="text-[10px] px-1.5 py-0 font-mono">
                GP: {gpPercent.toFixed(1)}%
              </Badge>
            )}
            {deal.margin_approved === false && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0">⏳ Pending approval</Badge>
            )}
            {deal.margin_approved === true && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">✓ Approved</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4 pt-4 border-t border-border/40">
          {[
            { label: 'Value', value: formatSGD(deal.value ?? 0), mono: true },
            { label: 'Win Probability', value: `${Math.round((deal.win_probability ?? 0) * 100)}%` },
            { label: 'Weighted', value: formatSGD(weighted), mono: true },
            { label: 'Owner', value: deal.owner_name || '—' },
            { label: 'GP%', value: gpPercent != null ? `${gpPercent.toFixed(1)}%` : '—' },
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
          <TabsTrigger value="margin" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Margin & Profitability
          </TabsTrigger>
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
          {hasMargin ? (
            <>
              {/* Margin Data Display */}
              <div className="data-panel">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="consulting-headline flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Margin & Profitability
                  </h3>
                  <div className="flex items-center gap-2">
                    {deal.margin_approved === true && (
                      <Badge variant="success" className="text-[10px]">✓ Approved</Badge>
                    )}
                    {deal.margin_approved === false && (
                      <Badge variant="warning" className="text-[10px]">⏳ Pending approval</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="section-label">Revenue</p>
                    <p className="sgd-value font-semibold mt-0.5 text-sm">
                      {formatSGD(deal.margin_revenue ?? deal.revenue ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="section-label">Cost of Goods</p>
                    <p className="sgd-value font-semibold mt-0.5 text-sm">
                      {formatSGD(deal.cost_of_goods ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="section-label">Cost of Services</p>
                    <p className="sgd-value font-semibold mt-0.5 text-sm">
                      {formatSGD(deal.cost_of_services ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="section-label">MDF Subsidy</p>
                    <p className="sgd-value font-semibold mt-0.5 text-sm">
                      {formatSGD(deal.mdf_subsidy ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="section-label">Gross Profit</p>
                    <p className="sgd-value font-semibold mt-0.5 text-sm">
                      {formatSGD(deal.margin_gp ?? deal.gross_profit ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="section-label">GP %</p>
                    <div className="mt-0.5">
                      {gpPercent != null ? (
                        <Badge variant={gpVariant as any} className="text-xs font-mono px-2 py-0.5">
                          {gpPercent.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Margin floor warning */}
                {gpPercent != null && gpPercent < 15 && (
                  <div className="mt-4 p-3 rounded bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    ⚠️ This deal is below the 15% margin floor. Consider reviewing pricing before advancing.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Create Margin Form */
            <div className="data-panel">
              <h3 className="consulting-headline flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4" />
                Add Margin Data
              </h3>
              <p className="text-xs text-muted-foreground mb-4">No margin record exists for this deal. Create one to track profitability.</p>

              {!showMarginForm ? (
                <Button onClick={() => {
                  setMarginForm(f => ({ ...f, revenue: String(deal.value ?? '') }));
                  setShowMarginForm(true);
                }} className="text-xs h-8">
                  <DollarSign className="h-3 w-3 mr-1" />Add Margin Record
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="section-label">Revenue (SGD)</label>
                      <Input
                        type="number"
                        value={marginForm.revenue}
                        onChange={e => setMarginForm(f => ({ ...f, revenue: e.target.value }))}
                        placeholder="0"
                        className="h-8 text-sm bg-muted"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="section-label">Cost of Goods</label>
                      <Input
                        type="number"
                        value={marginForm.cost_of_goods}
                        onChange={e => setMarginForm(f => ({ ...f, cost_of_goods: e.target.value }))}
                        placeholder="0"
                        className="h-8 text-sm bg-muted"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="section-label">Cost of Services</label>
                      <Input
                        type="number"
                        value={marginForm.cost_of_services}
                        onChange={e => setMarginForm(f => ({ ...f, cost_of_services: e.target.value }))}
                        placeholder="0"
                        className="h-8 text-sm bg-muted"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="section-label">MDF Subsidy</label>
                      <Input
                        type="number"
                        value={marginForm.mdf_subsidy}
                        onChange={e => setMarginForm(f => ({ ...f, mdf_subsidy: e.target.value }))}
                        placeholder="0"
                        className="h-8 text-sm bg-muted"
                      />
                    </div>
                  </div>

                  {/* Live GP preview */}
                  {(() => {
                    const rev = parseFloat(marginForm.revenue) || 0;
                    const cogs = parseFloat(marginForm.cost_of_goods) || 0;
                    const cos = parseFloat(marginForm.cost_of_services) || 0;
                    const mdf = parseFloat(marginForm.mdf_subsidy) || 0;
                    const gp = rev - cogs - cos + mdf;
                    const gpPct = rev > 0 ? (gp / rev) * 100 : 0;
                    const previewVariant = gpPct >= 20 ? 'success' : gpPct >= 12 ? 'warning' : 'destructive';

                    return rev > 0 ? (
                      <div className="p-3 rounded bg-muted/50 border border-border/40 flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gross Profit: </span>
                          <span className="sgd-value font-semibold">{formatSGD(gp)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">GP%: </span>
                          <Badge variant={previewVariant as any} className="text-xs font-mono px-2 py-0.5">
                            {gpPct.toFixed(1)}%
                          </Badge>
                        </div>
                        {gpPct < 15 && (
                          <span className="text-[11px] text-destructive">⚠️ Below 15% floor</span>
                        )}
                      </div>
                    ) : null;
                  })()}

                  <div className="space-y-1">
                    <label className="section-label">Pricing Notes</label>
                    <Textarea
                      value={marginForm.pricing_notes}
                      onChange={e => setMarginForm(f => ({ ...f, pricing_notes: e.target.value }))}
                      placeholder="Any notes on pricing rationale, discounts, or special conditions..."
                      className="text-sm bg-muted min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateMargin} disabled={saving} className="text-xs h-8">
                      <Save className="h-3 w-3 mr-1" />
                      {saving ? 'Saving...' : 'Save Margin'}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowMarginForm(false)} className="text-xs h-8">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
