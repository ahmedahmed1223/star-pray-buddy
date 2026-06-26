import { supabase } from '@/integrations/supabase/client';
import { exportData, importData } from '@/lib/store';

export interface CloudBackup {
  id: string;
  name: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export async function uploadBackup(name?: string): Promise<CloudBackup> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const json = exportData();
  const payload = JSON.parse(json);
  const finalName = name || `نسخة ${new Date().toLocaleString('ar')}`;
  const size = new Blob([json]).size;

  const { data, error } = await supabase
    .from('app_backups')
    .insert({ user_id: user.id, name: finalName, payload, size_bytes: size })
    .select('id, name, size_bytes, created_at, updated_at')
    .single();
  if (error) throw error;
  return data as CloudBackup;
}

export async function listBackups(): Promise<CloudBackup[]> {
  const { data, error } = await supabase
    .from('app_backups')
    .select('id, name, size_bytes, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as CloudBackup[];
}

export async function restoreBackup(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('app_backups')
    .select('payload')
    .eq('id', id)
    .single();
  if (error) throw error;
  const json = JSON.stringify(data.payload);
  return importData(json);
}

export async function deleteBackup(id: string): Promise<void> {
  const { error } = await supabase.from('app_backups').delete().eq('id', id);
  if (error) throw error;
}

const AUTO_SYNC_KEY = 'auto_cloud_sync_enabled';
export const isAutoSyncEnabled = () => localStorage.getItem(AUTO_SYNC_KEY) === '1';
export const setAutoSyncEnabled = (v: boolean) => localStorage.setItem(AUTO_SYNC_KEY, v ? '1' : '0');
