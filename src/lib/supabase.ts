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

/* ============================================================
   EXPERT DEMANDES (real-time from Supabase)
   ============================================================ */
export interface ExpertDemandeRow {
  id: string;
  nom: string;
  pays: string;
  whatsapp: string;
  ville: string;
  fonction: string;
  adresse: string;
  bio: string;
  cv_name: string | null;
  cv_data: string | null;
  status: string;
  created_at: string;
}

export async function fetchDemandes(): Promise<ExpertDemandeRow[]> {
  const { data, error } = await supabase
    .from('expert_demandes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as ExpertDemandeRow[]) ?? [];
}

export async function insertDemande(
  d: Omit<ExpertDemandeRow, 'id' | 'created_at' | 'status'>
): Promise<boolean> {
  const { error } = await supabase.from('expert_demandes').insert({
    nom: d.nom,
    pays: d.pays,
    whatsapp: d.whatsapp,
    ville: d.ville,
    fonction: d.fonction,
    adresse: d.adresse,
    bio: d.bio,
    cv_name: d.cv_name ?? null,
    cv_data: d.cv_data ?? null,
  });
  if (error) return false;
  return true;
}

export async function updateDemandeStatus(
  id: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from('expert_demandes')
    .update({ status })
    .eq('id', id);
  if (error) return false;
  return true;
}

export async function deleteDemande(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('expert_demandes')
    .delete()
    .eq('id', id);
  if (error) return false;
  return true;
}

/* ============================================================
   EXPERTS (approved, real-time from Supabase)
   ============================================================ */
export interface ExpertRow {
  id: string;
  nom: string;
  pays: string;
  whatsapp: string;
  ville: string;
  fonction: string;
  adresse: string;
  bio: string;
  photo: string | null;
  status: string;
  travaux: string[];
  prix_jour: string | null;
  code: string | null;
  is_default: boolean;
  created_at: string;
}

export async function fetchExperts(): Promise<ExpertRow[]> {
  const { data, error } = await supabase
    .from('experts')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data as ExpertRow[]) ?? [];
}

export async function insertExpert(
  e: Omit<ExpertRow, 'id' | 'created_at'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('experts')
    .insert({
      nom: e.nom,
      pays: e.pays,
      whatsapp: e.whatsapp,
      ville: e.ville,
      fonction: e.fonction,
      adresse: e.adresse,
      bio: e.bio,
      photo: e.photo ?? null,
      status: e.status,
      travaux: e.travaux ?? [],
      prix_jour: e.prix_jour ?? null,
      code: e.code ?? null,
      is_default: e.is_default ?? false,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function updateExpert(
  id: string,
  updates: Partial<Omit<ExpertRow, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('experts')
    .update(updates)
    .eq('id', id);
  if (error) return false;
  return true;
}

export async function deleteExpert(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('experts')
    .delete()
    .eq('id', id);
  if (error) return false;
  return true;
}
