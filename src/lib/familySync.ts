import { supabase } from '@/integrations/supabase/client';
import { getChildren, type Child } from '@/lib/store';

export interface FamilyKidRow {
  id: string;
  owner_id: string;
  child_id: string;
  name: string;
  avatar_index: number;
  total_stars: number;
  last_synced_at: string;
}

/** Push local kids to cloud, linked to the current parent account. */
export async function syncKidsToCloud(): Promise<{ synced: number }> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const kids = getChildren();
  if (kids.length === 0) return { synced: 0 };

  const rows = kids.map((c: Child) => ({
    owner_id: user.id,
    child_id: c.id,
    name: c.name,
    avatar_index: c.avatarIndex,
    total_stars: c.totalStars,
    last_synced_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('family_kids')
    .upsert(rows, { onConflict: 'owner_id,child_id' });
  if (error) throw error;
  return { synced: rows.length };
}

/** Read kids linked to the current parent account. */
export async function listFamilyKids(): Promise<FamilyKidRow[]> {
  const { data, error } = await supabase
    .from('family_kids')
    .select('id, owner_id, child_id, name, avatar_index, total_stars, last_synced_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as FamilyKidRow[];
}

/** Remove a child link from the parent's account. Local data untouched. */
export async function unlinkFamilyKid(childId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');
  const { error } = await supabase
    .from('family_kids')
    .delete()
    .eq('owner_id', user.id)
    .eq('child_id', childId);
  if (error) throw error;
}
