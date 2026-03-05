import { useMemo, useState } from 'react';
import { mockArtifacts, mockOpportunities, getAccountById, getUserById } from '@/data/mockData';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StageBadge } from '@/components/StatusBadges';
import { Search, FileText, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PitchLibrary() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const enriched = useMemo(() => {
    return mockArtifacts.map(a => {
      const opp = mockOpportunities.find(o => o.id === a.opportunity_id);
      const acc = getAccountById(a.account_id);
      return { ...a, opp, account: acc, creator: getUserById(a.created_by_user_id) };
    });
  }, []);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.account?.account_name.toLowerCase().includes(q) ||
        a.opp?.opportunity_title.toLowerCase().includes(q) ||
        a.keywords.some(k => k.toLowerCase().includes(q)) ||
        a.opp?.pitch_summary?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(a => a.pitch_type === typeFilter);
    }
    return result;
  }, [enriched, search, typeFilter]);

  const pitchTypes = [...new Set(mockArtifacts.map(a => a.pitch_type))];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Pitch Library</h1>
      <p className="text-sm text-muted-foreground">Search and reuse pitch artifacts across all accounts and opportunities.</p>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search artifacts, accounts, keywords..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All pitch types</option>
          {pitchTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full table-compact">
          <thead>
            <tr className="border-b">
              <th className="text-left">Title</th>
              <th className="text-left">Type</th>
              <th className="text-left">Pitch Type</th>
              <th className="text-left">Account</th>
              <th className="text-left">Opportunity</th>
              <th className="text-left">Stage</th>
              <th className="text-left">Keywords</th>
              <th className="text-left">Created</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="font-medium flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {a.title}
                </td>
                <td><Badge variant="outline">{a.artifact_type}</Badge></td>
                <td><Badge variant="secondary">{a.pitch_type}</Badge></td>
                <td className="text-muted-foreground">{a.account?.account_name}</td>
                <td>
                  {a.opp && <Link to={`/opportunity/${a.opp.id}`} className="text-primary hover:underline text-sm">{a.opp.opportunity_title}</Link>}
                </td>
                <td>{a.opp && <StageBadge stage={a.opp.stage} />}</td>
                <td>
                  <div className="flex gap-1 flex-wrap">{a.keywords.slice(0, 3).map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}</div>
                </td>
                <td className="text-muted-foreground">{formatDate(a.created_at)}</td>
                <td className="text-center">
                  <Button size="sm" variant="ghost" title="Reuse as template"><Copy className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
