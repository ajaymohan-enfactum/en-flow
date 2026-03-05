import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAccounts, mockOpportunities } from '@/data/mockData';
import { getWeightedValue } from '@/types';
import { formatSGD, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Building2 } from 'lucide-react';

export default function Accounts() {
  const [search, setSearch] = useState('');

  const enriched = useMemo(() => {
    return mockAccounts.map(acc => {
      const opps = mockOpportunities.filter(o => o.account_id === acc.id && !['Closed', 'Lost'].includes(o.stage));
      return {
        ...acc,
        openPipelineValue: opps.reduce((s, o) => s + o.est_value_sgd, 0),
        openWeightedEffective: opps.reduce((s, o) => s + getWeightedValue(o), 0),
        oppCount: opps.length,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(a =>
      a.account_name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.sector?.toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const tierVariant = (t: string) => t === 'A' ? 'default' : t === 'B' ? 'secondary' : 'outline';
  const icpVariant = (i: string) => i === 'High' ? 'success' : i === 'Medium' ? 'warning' : 'secondary';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Accounts</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full table-compact">
          <thead>
            <tr className="border-b">
              <th className="text-left">Account</th>
              <th className="text-left">Country</th>
              <th className="text-left">Sector</th>
              <th className="text-center">Tier</th>
              <th className="text-center">ICP Fit</th>
              <th className="text-center">Strategic</th>
              <th className="text-right">Open Pipeline</th>
              <th className="text-right">Weighted (Eff)</th>
              <th className="text-center">Open Opps</th>
              <th className="text-left">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                <td>
                  <Link to={`/accounts/${acc.id}`} className="text-primary hover:underline font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />{acc.account_name}
                  </Link>
                </td>
                <td className="text-muted-foreground">{acc.country}</td>
                <td className="text-muted-foreground">{acc.sector || '—'}</td>
                <td className="text-center"><Badge variant={tierVariant(acc.tier) as any}>{acc.tier}</Badge></td>
                <td className="text-center"><Badge variant={icpVariant(acc.icp_fit) as any}>{acc.icp_fit}</Badge></td>
                <td className="text-center">{acc.strategic_logo ? <Star className="h-4 w-4 text-accent inline" /> : '—'}</td>
                <td className="text-right sgd-value">{formatSGD(acc.openPipelineValue)}</td>
                <td className="text-right sgd-value">{formatSGD(acc.openWeightedEffective)}</td>
                <td className="text-center">{acc.oppCount}</td>
                <td className="text-muted-foreground">{formatDate(acc.last_activity_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
