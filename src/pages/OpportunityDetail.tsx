import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
        <p>Opportunity not found.</p>
        <Link to="/pipeline" className="text-primary hover:underline">Back to Pipeline</Link>
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
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Pipeline
      </Link>

      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{opp.opportunity_title}</h1>
            <p className="text-sm text-muted-foreground">
              <Link to={`/accounts/${opp.account_id}`} className="text-primary hover:underline">{account?.account_name}</Link>
              {' · '}{opp.country} · {opp.workstream}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StageBadge stage={opp.stage} />
            <FollowupBadge status={followup} />
            <ConfidenceBadge score={confidence} />
            {stageRule && <StuckBadge stageAgeDays={stageAge} slaDays={stageRule.sla_days_in_stage} />}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-5 pt-5 border-t">
          <div>
            <p className="section-label">Est. Value</p>
            <p className="text-lg font-bold sgd-value">{formatSGD(opp.est_value_sgd)}</p>
          </div>
          <div>
            <p className="section-label">Prob (System)</p>
            <p className="text-lg font-bold">{formatPercent(opp.probability_system)}</p>
          </div>
          <div>
            <p className="section-label">Prob (Effective)</p>
            <p className="text-lg font-bold">{formatPercent(effectiveProb)}</p>
          </div>
          <div>
            <p className="section-label">Weighted (Eff)</p>
            <p className="text-lg font-bold sgd-value">{formatSGD(getWeightedValue(opp))}</p>
          </div>
          <div>
            <p className="section-label">Owner</p>
            <p className="text-sm font-medium">{owner?.name}</p>
          </div>
          <div>
            <p className="section-label">Stage Age</p>
            <p className="text-sm font-medium">{stageAge} days</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({oppTasks.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({oppActivities.length})</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts ({oppArtifacts.length})</TabsTrigger>
          <TabsTrigger value="history">Stage History</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({oppContacts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {opp.pitch_summary && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-2">Pitch Summary</h3>
              <p className="text-sm leading-relaxed">{opp.pitch_summary}</p>
            </div>
          )}
          {opp.notes && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-2">Notes</h3>
              <p className="text-sm leading-relaxed">{opp.notes}</p>
            </div>
          )}
          {opp.tags.length > 0 && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-2">Tags</h3>
              <div className="flex gap-1.5 flex-wrap">{opp.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            </div>
          )}
          {opp.source && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-2">Source</h3>
              <p className="text-sm">{opp.source}</p>
            </div>
          )}
          {opp.probability_override !== undefined && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-2">Probability Override</h3>
              <p className="text-sm">{formatPercent(opp.probability_override)} (system: {formatPercent(opp.probability_system)})</p>
              {opp.probability_override_reason && <p className="text-sm text-muted-foreground mt-1">Reason: {opp.probability_override_reason}</p>}
            </div>
          )}
          {/* Deal review for closed/lost */}
          {(opp.stage === 'Closed' || opp.stage === 'Lost') && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="consulting-headline mb-3">Deal Review</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="section-label">Outcome</span><p className="mt-1">{opp.outcome_status}</p></div>
                <div><span className="section-label">Close Date</span><p className="mt-1">{formatDate(opp.close_date)}</p></div>
                {opp.win_reason_tags && <div className="col-span-2"><span className="section-label">Win Reasons</span><div className="flex gap-1 mt-1 flex-wrap">{opp.win_reason_tags.map(t => <Badge key={t} variant="success">{t}</Badge>)}</div></div>}
                {opp.loss_reason_tags && <div className="col-span-2"><span className="section-label">Loss Reasons</span><div className="flex gap-1 mt-1 flex-wrap">{opp.loss_reason_tags.map(t => <Badge key={t} variant="destructive">{t}</Badge>)}</div></div>}
                {opp.competitors && <div className="col-span-2"><span className="section-label">Competitors</span><div className="flex gap-1 mt-1 flex-wrap">{opp.competitors.map(c => <Badge key={c} variant="outline">{c}</Badge>)}</div></div>}
                {opp.outcome_notes && <div className="col-span-2"><span className="section-label">Outcome Notes</span><p className="mt-1">{opp.outcome_notes}</p></div>}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="bg-card rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="consulting-headline">Tasks</h3>
              <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" />Add Task</Button>
            </div>
            {oppTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {oppTasks.map(task => {
                  const isOverdue = task.status === 'Open' && new Date(task.due_date) < new Date();
                  return (
                    <div key={task.id} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={cn('h-4 w-4', task.status === 'Done' ? 'text-success' : 'text-muted-foreground')} />
                        <div>
                          <p className={cn('text-sm font-medium', task.status === 'Done' && 'line-through text-muted-foreground')}>{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.task_type} · {getUserById(task.owner_user_id)?.name}</p>
                        </div>
                      </div>
                      <Badge variant={isOverdue ? 'destructive' : task.status === 'Done' ? 'success' : 'secondary'}>
                        {task.status === 'Done' ? 'Done' : formatDate(task.due_date)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="bg-card rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="consulting-headline">Activity Timeline</h3>
              <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" />Add Activity</Button>
            </div>
            <div className="space-y-4">
              {oppActivities.map(act => (
                <div key={act.id} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 w-px bg-border" />
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{act.activity_type}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(act.activity_date)}</span>
                    </div>
                    <p className="text-sm font-medium">{act.summary}</p>
                    {act.details && <p className="text-sm text-muted-foreground mt-1">{act.details}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{getUserById(act.created_by_user_id)?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-4">
          <div className="bg-card rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="consulting-headline">Artifacts</h3>
              <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1" />Upload</Button>
            </div>
            {oppArtifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No artifacts yet.</p>
            ) : (
              <div className="space-y-2">
                {oppArtifacts.map(art => (
                  <div key={art.id} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{art.title}</p>
                        <p className="text-xs text-muted-foreground">{art.artifact_type} · {art.pitch_type} · {art.version || 'v1'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {art.shared_with_client && <Badge variant="info">Shared</Badge>}
                      <span className="text-xs text-muted-foreground">{formatDate(art.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-card rounded-lg border p-5">
            <h3 className="consulting-headline mb-4">Stage History</h3>
            {oppHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stage changes recorded.</p>
            ) : (
              <div className="space-y-3">
                {oppHistory.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <StageBadge stage={h.from_stage} />
                    <span className="text-muted-foreground">→</span>
                    <StageBadge stage={h.to_stage} />
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{getUserById(h.changed_by_user_id)?.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatDate(h.changed_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <div className="bg-card rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="consulting-headline">Contacts</h3>
              <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" />Link Contact</Button>
            </div>
            {opp.primary_contact_free_text && (
              <p className="text-sm mb-3 text-muted-foreground">Quick capture: {opp.primary_contact_free_text}</p>
            )}
            <div className="space-y-2">
              {oppContacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{c.contact_name}</p>
                    <p className="text-xs text-muted-foreground">{c.title} · {c.email}</p>
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
