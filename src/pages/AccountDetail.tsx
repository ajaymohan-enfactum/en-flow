import { useParams, Link } from 'react-router-dom';
import { mockAccounts, mockOpportunities, mockArtifacts, mockContacts, mockActivities, getUserById } from '@/data/mockData';
import { getWeightedValue } from '@/types';
import { formatSGD, formatDate } from '@/lib/format';
import { StageBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star } from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const acc = mockAccounts.find(a => a.id === id);
  if (!acc) return <div className="p-6"><Link to="/accounts" className="text-primary">Back</Link><p>Account not found.</p></div>;

  const opps = mockOpportunities.filter(o => o.account_id === acc.id);
  const artifacts = mockArtifacts.filter(a => a.account_id === acc.id);
  const contacts = mockContacts.filter(c => c.account_id === acc.id);
  const activities = mockActivities.filter(a => opps.some(o => o.id === a.opportunity_id)).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <Link to="/accounts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to Accounts</Link>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">{acc.account_name} {acc.strategic_logo && <Star className="h-4 w-4 text-accent" />}</h1>
            <p className="text-sm text-muted-foreground mt-1">{acc.country} · {acc.sector || 'No sector'}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={acc.tier === 'A' ? 'default' : 'secondary'}>Tier {acc.tier}</Badge>
            <Badge variant={acc.icp_fit === 'High' ? 'success' : 'warning'}>{acc.icp_fit} ICP</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities ({opps.length})</TabsTrigger>
          <TabsTrigger value="artifacts">Pitch Library ({artifacts.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-4">
          <div className="bg-card rounded-lg border overflow-x-auto">
            <table className="w-full table-compact">
              <thead><tr className="border-b"><th className="text-left">Opportunity</th><th className="text-left">Stage</th><th className="text-right">Value</th><th className="text-left">Owner</th><th className="text-left">Last Activity</th></tr></thead>
              <tbody>
                {opps.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td><Link to={`/opportunity/${o.id}`} className="text-primary hover:underline">{o.opportunity_title}</Link></td>
                    <td><StageBadge stage={o.stage} /></td>
                    <td className="text-right sgd-value">{formatSGD(o.est_value_sgd)}</td>
                    <td className="text-muted-foreground">{getUserById(o.opportunity_owner_user_id)?.name}</td>
                    <td className="text-muted-foreground">{formatDate(o.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-4">
          <div className="bg-card rounded-lg border p-5 space-y-2">
            {artifacts.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md">
                <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.artifact_type} · {a.pitch_type}</p></div>
                <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <div className="bg-card rounded-lg border p-5 space-y-2">
            {contacts.map(c => (
              <div key={c.id} className="py-2 px-3 hover:bg-muted/50 rounded-md">
                <p className="text-sm font-medium">{c.contact_name}</p>
                <p className="text-xs text-muted-foreground">{c.title} · {c.email}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="bg-card rounded-lg border p-5 space-y-3">
            {activities.map(a => (
              <div key={a.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm"><span className="font-medium">{getUserById(a.created_by_user_id)?.name}</span> · {a.activity_type} · {a.summary}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.activity_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
