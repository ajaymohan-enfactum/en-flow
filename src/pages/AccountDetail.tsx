import { useParams, Link } from 'react-router-dom';
import { mockAccounts, mockOpportunities, mockArtifacts, mockContacts, mockActivities, getUserById } from '@/data/mockData';
import { formatSGD, formatDate } from '@/lib/format';
import { StageBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star } from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const acc = mockAccounts.find(a => a.id === id);
  if (!acc) return <div className="p-6"><Link to="/accounts" className="text-primary">Back</Link><p className="mt-2">Account not found.</p></div>;

  const opps = mockOpportunities.filter(o => o.account_id === acc.id);
  const artifacts = mockArtifacts.filter(a => a.account_id === acc.id);
  const contacts = mockContacts.filter(c => c.account_id === acc.id);
  const activities = mockActivities.filter(a => opps.some(o => o.id === a.opportunity_id)).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-fade-in">
      <Link to="/accounts" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" />Accounts</Link>

      <div className="data-panel header-stripe">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">{acc.account_name} {acc.strategic_logo && <Star className="h-3.5 w-3.5 text-warning" />}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{acc.country} · {acc.sector || 'No sector'}</p>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={acc.tier === 'A' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">Tier {acc.tier}</Badge>
            <Badge variant={acc.icp_fit === 'High' ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0">{acc.icp_fit} ICP</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList className="bg-card border">
          <TabsTrigger value="opportunities">Opportunities ({opps.length})</TabsTrigger>
          <TabsTrigger value="artifacts">Pitch Library ({artifacts.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-3">
          <div className="data-panel overflow-x-auto p-0">
            <table className="w-full table-compact">
              <thead><tr><th className="text-left">Opportunity</th><th className="text-left">Stage</th><th className="text-right">Value</th><th className="text-left">Owner</th><th className="text-left">Last Activity</th></tr></thead>
              <tbody>
                {opps.map(o => (
                  <tr key={o.id}>
                    <td><Link to={`/opportunity/${o.id}`} className="text-primary hover:underline">{o.opportunity_title}</Link></td>
                    <td><StageBadge stage={o.stage} /></td>
                    <td className="text-right sgd-value">{formatSGD(o.est_value_sgd)}</td>
                    <td className="text-muted-foreground">{getUserById(o.opportunity_owner_user_id)?.name}</td>
                    <td className="text-muted-foreground text-xs">{formatDate(o.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-3">
          <div className="data-panel space-y-1">
            {artifacts.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 px-2.5 hover:bg-muted/30 rounded transition-colors">
                <div><p className="text-sm font-medium">{a.title}</p><p className="text-[11px] text-muted-foreground">{a.artifact_type} · {a.pitch_type}</p></div>
                <span className="text-[11px] text-muted-foreground">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-3">
          <div className="data-panel space-y-1">
            {contacts.map(c => (
              <div key={c.id} className="py-2 px-2.5 hover:bg-muted/30 rounded transition-colors">
                <p className="text-sm font-medium">{c.contact_name}</p>
                <p className="text-[11px] text-muted-foreground">{c.title} · {c.email}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-3">
          <div className="data-panel space-y-2">
            {activities.map(a => (
              <div key={a.id} className="flex gap-2.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm"><span className="font-medium">{getUserById(a.created_by_user_id)?.name}</span> <span className="text-muted-foreground">· {a.activity_type}</span></p>
                  <p className="text-[11px] text-muted-foreground">{a.summary} · {formatDate(a.activity_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
