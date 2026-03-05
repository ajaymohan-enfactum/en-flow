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
      return { ...acc, openPipelineValue: opps.reduce((s, o) => s + o.est_value_sgd, 0), openWeightedEffective: opps.reduce((s, o) => s + getWeightedValue(o), 0), oppCount: opps.length };
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(a => a.account_name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q) || a.sector?.toLowerCase().includes(q));
  }, [enriched, search]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">Accounts</h1>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm bg-card" />
      </div>

      <div className="data-panel overflow-x-auto p-0">
        <table className="w-full table-compact">
          <thead>
            <tr>
              <th className="text-left">Account</th>
              <th className="text-left">Country</th>
              <th className="text-left">Sector</th>
              <th className="text-center">Tier</th>
              <th className="text-center">ICP</th>
              <th className="text-center">Logo</th>
              <th className="text-right">Open Pipeline</th>
              <th className="text-right">Weighted (Eff)</th>
              <th className="text-center">Opps</th>
              <th className="text-left">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id}>
                <td>
                  <Link to={`/accounts/${acc.id}`} className="text-primary hover:underline font-medium text-sm flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 flex-shrink-0" />{acc.account_name}
                  </Link>
                </td>
                <td className="text-muted-foreground">{acc.country}</td>
                <td className="text-muted-foreground">{acc.sector || '—'}</td>
                <td className="text-center"><Badge variant={acc.tier === 'A' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">{acc.tier}</Badge></td>
                <td className="text-center"><Badge variant={acc.icp_fit === 'High' ? 'success' : acc.icp_fit === 'Medium' ? 'warning' : 'secondary'} className="text-[10px] px-1.5 py-0">{acc.icp_fit}</Badge></td>
                <td className="text-center">{acc.strategic_logo ? <Star className="h-3.5 w-3.5 text-warning inline" /> : ''}</td>
                <td className="text-right sgd-value">{formatSGD(acc.openPipelineValue)}</td>
                <td className="text-right sgd-value">{formatSGD(acc.openWeightedEffective)}</td>
                <td className="text-center text-muted-foreground">{acc.oppCount}</td>
                <td className="text-muted-foreground text-xs">{formatDate(acc.last_activity_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
