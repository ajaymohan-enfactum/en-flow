import { useParams, Link } from 'react-router-dom';
import { useAccount } from '@/hooks/useAccounts';
import { useDeals } from '@/hooks/useDeals';
import { formatSGD } from '@/lib/format';
import { StageBadge } from '@/components/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: acc, isLoading } = useAccount(id);
  const { data: allDeals = [] } = useDeals();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!acc) return <div className="p-6"><Link to="/accounts" className="text-primary">Back</Link><p className="mt-2">Account not found.</p></div>;

  const accountDeals = allDeals.filter(d => d.account_id === acc.id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-fade-in">
      <Link to="/accounts" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" />Accounts</Link>

      <div className="data-panel header-stripe">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{acc.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{acc.industry || 'No industry'}</p>
          </div>
          <div className="flex gap-1.5">
            {acc.tier && <Badge variant={acc.tier === 'A' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">Tier {acc.tier}</Badge>}
          </div>
        </div>
        {(acc.primary_contact_name || acc.website) && (
          <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-3 text-xs">
            {acc.primary_contact_name && (
              <div>
                <span className="text-muted-foreground">Primary Contact:</span>
                <span className="ml-1">{acc.primary_contact_name}</span>
                {acc.primary_contact_email && <span className="text-muted-foreground ml-1">({acc.primary_contact_email})</span>}
              </div>
            )}
            {acc.website && (
              <div>
                <span className="text-muted-foreground">Website:</span>
                <a href={acc.website} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{acc.website}</a>
              </div>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="deals">
        <TabsList className="bg-card border">
          <TabsTrigger value="deals">Deals ({accountDeals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-3">
          <div className="data-panel overflow-x-auto p-0">
            <table className="w-full table-compact">
              <thead><tr><th className="text-left">Deal</th><th className="text-left">Stage</th><th className="text-right">Value</th><th className="text-left">Owner</th><th className="text-left">Expected Close</th></tr></thead>
              <tbody>
                {accountDeals.map(d => (
                  <tr key={d.id}>
                    <td><Link to={`/opportunity/${d.id}`} className="text-primary hover:underline">{d.title}</Link></td>
                    <td><StageBadge stage={d.stage || 'Prospect'} /></td>
                    <td className="text-right sgd-value">{formatSGD(d.value ?? 0)}</td>
                    <td className="text-muted-foreground">{d.owner_name}</td>
                    <td className="text-muted-foreground text-xs">{d.expected_close_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
