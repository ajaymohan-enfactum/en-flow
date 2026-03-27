import { useQuery } from '@tanstack/react-query';
import { db } from '@/integrations/supabase/db';

export interface DbEvent {
  id: string;
  module: string | null;
  entity_type: string | null;
  entity_id: string | null;
  event_type: string | null;
  payload: Record<string, any> | null;
  actor_id: string | null;
  occurred_at: string | null;
  created_at: string | null;
}

export function useEntityEvents(entityType: string, entityId: string | undefined) {
  return useQuery({
    queryKey: ['events', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await db
        .from('events')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as DbEvent[];
    },
    enabled: !!entityId,
  });
}
