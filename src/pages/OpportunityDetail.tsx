import { useParams, Link } from 'react-router-dom';
import { mockOpportunities, mockTasks, mockActivities, mockArtifacts, mockStageHistory, mockContacts, getUserById, getAccountById, getStageRule } from '@/data/mockData';
import { getEffectiveProbability, getWeightedValue, getFollowupStatus, getConfidenceScore, getStageAgeDays } from '@/types';
import { formatSGD, formatPercent, formatDate } from '@/lib/format';
import { StageBadge, FollowupBadge, ConfidenceBadge, StuckBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, CheckCircle, FileText, Clock, Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const opp = mockOpportunities.find(o => o.id === id);

  if (!opp) {
    return (
      <div className="p-6">
        <Link to="/pipeline" className="text-primary hover:underline text-sm">← Back to Pipeline</Link>
        <p className="mt-2">Opportunity not found.</p>
      </div>
    );
  }

  const account = getAccountById(opp.account_id);
  const owner = getUserById(opp.opportunity_owner_user_id);
  const relOwner = opp.relationship_owner_user_id ? getUserById(opp.relationship_owner_user_id) : undefined;
  const stageRule = getStageRule(opp.stage);
  const effectiveProb = getEffectiveProbability(opp);
  const oppTasks = mockTasks.filter(t => t.opportunity_id === opp.id);
  const oppActivities = mockActivities.filter(a => a.opportunity_id === opp.id).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());
  const oppArtifacts = mockArtifacts.filter(a => a.opportunity_id === opp.id);
  const oppHistory = mockStageHistory.filter(h => h.opportunity_id === opp.id).sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  const oppContacts = mockContacts.filter(c => c.account_id === opp.account_id);
  const followup = getFollowupStatus(mockTasks, opp.id);
  const confidence = getConfidenceScore(opp, mockTasks, mockActivities, mockArtifacts, stageRule);
  const stageAge = getStageAgeDays(opp, mockStageHistory);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-fade-in">
      <Link to="/pipeline" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />Pipeline
      </Link>

      {/* Header card */}
      <div className="data-panel header-stripe">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold">{opp.opportunity_title}</h1>
            <p className="text-xs text-muted-foreground">
              <Link to={`/accounts/${opp.account_id}`} className="text-primary hover:underline">{account?.account_name}</Link>
              {' · '}{opp.country} · {opp.workstream}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <StageBadge stage={opp.stage} />
            <FollowupBadge status={followup} />
            <ConfidenceBadge score={confidence} />
            {stageRule && <StuckBadge stageAgeDays={stageAge} slaDays={stageRule.sla_days_in_stage} />}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4 pt-4 border-t border-border/40">
          {[
            { label: 'Est. Value', value: formatSGD(opp.est_value_sgd), mono: true },
            { label: 'Prob (System)', value: formatPercent(opp.probability_system) },
            { label: 'Prob (Effective)', value: formatPercent(effectiveProb) },
            { label: 'Weighted (Eff)', value: formatSGD(getWeightedValue(opp)), mono: true },
            { label: 'Owner', value: owner?.name || '—' },
            { label: 'Stage Age', value: `${stageAge}d` },
          ].map(item => (
            <div key={item.label}>
              <p className="section-label">{item.label}</p>
              <p className={cn('text-sm font-semibold mt-0.5', item.mono && 'sgd-value')}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({oppTasks.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({oppActivities.length})</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts ({oppArtifacts.length})</TabsTrigger>
          <TabsTrigger value="history">Stage History</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({oppContacts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          {opp.pitch_summary && (
            <div className="data-panel">
              <h3 className="consulting-headline mb-1.5">Pitch Summary</h3>
              <p className="text-sm leading-relaxed text-foreground/80">{opp.pitch_summary}</p>
            </div>
          )}
          {opp.notes && (
            <div className="data-panel">
              <h3 className="consulting-headline mb-1.5">Notes</h3>
              <p className="text-sm leading-relaxed text-foreground/80">{opp.notes}</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {opp.tags.length > 0 && (
              <div className="data-panel">
                <h3 className="consulting-headline mb-1.5">Tags</h3>
                <div className="flex gap-1 flex-wrap">{opp.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
              </div>
            )}
            {opp.source && (
              <div className="data-panel">
                <h3 className="consulting-headline mb-1.5">Source</h3>
                <p className="text-sm">{opp.source}</p>
              </div>
            )}
          </div>
          {opp.probability_override !== undefined && (
            <div className="data-panel">
              <h3 className="consulting-headline mb-1.5">Probability Override</h3>
              <p className="text-sm font-mono">{formatPercent(opp.probability_override)} <span className="text-muted-foreground">(system: {formatPercent(opp.probability_system)})</span></p>
              {opp.probability_override_reason && <p className="text-xs text-muted-foreground mt-1">{opp.probability_override_reason}</p>}
            </div>
          )}
          {(opp.stage === 'Closed' || opp.stage === 'Lost') && (
            <div className="data-panel">
              <h3 className="consulting-headline mb-2">Deal Review</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="section-label">Outcome</span><p className="mt-0.5">{opp.outcome_status}</p></div>
                <div><span className="section-label">Close Date</span><p className="mt-0.5">{formatDate(opp.close_date)}</p></div>
                {opp.win_reason_tags && <div className="col-span-2"><span className="section-label">Win Reasons</span><div className="flex gap-1 mt-1 flex-wrap">{opp.win_reason_tags.map(t => <Badge key={t} variant="success" className="text-[10px]">{t}</Badge>)}</div></div>}
                {opp.loss_reason_tags && <div className="col-span-2"><span className="section-label">Loss Reasons</span><div className="flex gap-1 mt-1 flex-wrap">{opp.loss_reason_tags.map(t => <Badge key={t} variant="destructive" className="text-[10px]">{t}</Badge>)}</div></div>}
                {opp.competitors && <div className="col-span-2"><span className="section-label">Competitors</span><div className="flex gap-1 mt-1 flex-wrap">{opp.competitors.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div></div>}
                {opp.outcome_notes && <div className="col-span-2"><span className="section-label">Notes</span><p className="mt-0.5 text-foreground/80">{opp.outcome_notes}</p></div>}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-3">
          <div className="data-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="consulting-headline">Tasks</h3>
              <Button size="sm" variant="secondary" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>
            </div>
            {oppTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet.</p>
            ) : (
              <div className="space-y-0.5">
                {oppTasks.map(task => {
                  const isOverdue = task.status === 'Open' && new Date(task.due_date) < new Date();
                  return (
                    <div key={task.id} className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle className={cn('h-3.5 w-3.5', task.status === 'Done' ? 'text-success' : 'text-muted-foreground')} />
                        <div>
                          <p className={cn('text-sm font-medium', task.status === 'Done' && 'line-through text-muted-foreground')}>{task.title}</p>
                          <p className="text-[11px] text-muted-foreground">{task.task_type} · {getUserById(task.owner_user_id)?.name}</p>
                        </div>
                      </div>
                      <span className={cn('text-[11px] font-mono', isOverdue ? 'text-destructive' : task.status === 'Done' ? 'text-success' : 'text-muted-foreground')}>
                        {task.status === 'Done' ? 'Done' : formatDate(task.due_date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-3">
          <div className="data-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="consulting-headline">Activity Timeline</h3>
              <Button size="sm" variant="secondary" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>
            </div>
            <div className="space-y-3">
              {oppActivities.map(act => (
                <div key={act.id} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div className="flex-1 w-px bg-border/40" />
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{act.activity_type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(act.activity_date)}</span>
                    </div>
                    <p className="text-sm font-medium">{act.summary}</p>
                    {act.details && <p className="text-xs text-muted-foreground mt-0.5">{act.details}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{getUserById(act.created_by_user_id)?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-3">
          <div className="data-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="consulting-headline">Artifacts</h3>
              <Button size="sm" variant="secondary" className="h-7 text-xs"><Upload className="h-3 w-3 mr-1" />Upload</Button>
            </div>
            {oppArtifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No artifacts yet.</p>
            ) : (
              <div className="space-y-0.5">
                {oppArtifacts.map(art => (
                  <div key={art.id} className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{art.title}</p>
                        <p className="text-[11px] text-muted-foreground">{art.artifact_type} · {art.pitch_type} · {art.version || 'v1'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {art.shared_with_client && <Badge variant="info" className="text-[10px] px-1.5 py-0">Shared</Badge>}
                      <span className="text-[10px] text-muted-foreground">{formatDate(art.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          <div className="data-panel">
            <h3 className="consulting-headline mb-3">Stage History</h3>
            {oppHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No stage changes recorded.</p>
            ) : (
              <div className="space-y-2">
                {oppHistory.map(h => (
                  <div key={h.id} className="flex items-center gap-2 text-sm py-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <StageBadge stage={h.from_stage} />
                    <span className="text-muted-foreground text-xs">→</span>
                    <StageBadge stage={h.to_stage} />
                    <span className="text-[11px] text-muted-foreground ml-auto">{getUserById(h.changed_by_user_id)?.name} · {formatDate(h.changed_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-3">
          <div className="data-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="consulting-headline">Contacts</h3>
              <Button size="sm" variant="secondary" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Link</Button>
            </div>
            {opp.primary_contact_free_text && (
              <p className="text-xs text-muted-foreground mb-2">Quick capture: {opp.primary_contact_free_text}</p>
            )}
            <div className="space-y-0.5">
              {oppContacts.map(c => (
                <div key={c.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded hover:bg-muted/30 transition-colors">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{c.contact_name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.title} · {c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
