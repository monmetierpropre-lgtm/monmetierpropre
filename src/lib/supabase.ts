import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 2 } },
});

export interface FilePricing {
  id: string;
  file_id: string;
  file_type: string;
  is_paid: boolean;
  price: string | null;
  payment_code: string | null;
  btn_label: string | null;
  btn_color: string | null;
  updated_at: string;
}

export interface AppSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export async function fetchAllPricing(): Promise<Record<string, FilePricing>> {
  const { data, error } = await supabase.from('file_pricing').select('*');
  if (error) return {};
  const map: Record<string, FilePricing> = {};
  (data as FilePricing[]).forEach((row) => {
    map[row.file_id] = row;
  });
  return map;
}

export async function upsertPricing(
  file_id: string,
  file_type: string,
  is_paid: boolean,
  price: string,
  payment_code: string,
  btn_label: string,
  btn_color: string
): Promise<void> {
  const { error } = await supabase.from('file_pricing').upsert(
    {
      file_id,
      file_type,
      is_paid,
      price: price || null,
      payment_code: payment_code || null,
      btn_label: btn_label || null,
      btn_color: btn_color || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'file_id' }
  );
  if (error) throw error;
}

export async function fetchSetting(key: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return null;
  return (data as AppSetting).value;
}

export async function upsertSetting(
  key: string,
  value: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('app_settings').upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
  if (error) throw error;
}
