import { Badge } from '@/components/ui/badge';
import { FollowupStatus } from '@/types';

interface FollowupBadgeProps {
  status: FollowupStatus;
}

export function FollowupBadge({ status }: FollowupBadgeProps) {
  const variantMap: Record<FollowupStatus, 'destructive' | 'warning' | 'success' | 'secondary'> = {
    Overdue: 'destructive',
    'Due Soon': 'warning',
    OK: 'success',
    None: 'secondary',
  };

  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const variant = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive';
  return <Badge variant={variant}>{score}</Badge>;
}

interface StageBadgeProps {
  stage: string;
}

const STAGE_VARIANT: Record<string, 'default' | 'info' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  'Prospect': 'default',
  'Secured lead': 'info',
  'Pitching': 'secondary',
  'Proposal sent': 'warning',
  'Cold, follow up later': 'secondary',
  'Closed': 'success',
  'Lost': 'destructive',
};

export function StageBadge({ stage }: StageBadgeProps) {
  return <Badge variant={STAGE_VARIANT[stage] || 'outline'}>{stage}</Badge>;
}

interface StuckBadgeProps {
  stageAgeDays: number;
  slaDays: number;
}

export function StuckBadge({ stageAgeDays, slaDays }: StuckBadgeProps) {
  if (stageAgeDays <= slaDays) return null;
  return <Badge variant="destructive">Stuck {stageAgeDays}d</Badge>;
}
