import { useEffect, useState } from 'react';
import {
  supabase,
  fetchAllPricing,
  fetchSetting,
  type FilePricing,
} from '@/lib/supabase';

export function usePricing() {
  const [pricing, setPricing] = useState<Record<string, FilePricing>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAllPricing().then((data) => {
      if (mounted) {
        setPricing(data);
        setLoading(false);
      }
    });

    const channel = supabase
      .channel('file_pricing_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'file_pricing' },
        () => {
          fetchAllPricing().then((data) => {
            if (mounted) setPricing(data);
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { pricing, loading };
}

export interface AccueilButtons {
  plombier: { nom: string; url: string };
  plafonneur: { nom: string; url: string };
  carreleur: { nom: string; url: string };
  autres: { nom: string; url: string };
}

export function useAccueilButtons() {
  const [buttons, setButtons] = useState<AccueilButtons | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchSetting('accueil_buttons').then((data) => {
      if (mounted && data) setButtons(data as unknown as AccueilButtons);
    });

    const channel = supabase
      .channel('accueil_buttons_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'key=eq.accueil_buttons' },
        (payload) => {
          if (mounted && payload.new) {
            setButtons((payload.new as { value: AccueilButtons }).value);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return buttons;
}

export function useReglesText() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchSetting('regles_text').then((data) => {
      if (mounted && data) setText((data as { text: string }).text);
    });

    const channel = supabase
      .channel('regles_text_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'key=eq.regles_text' },
        (payload) => {
          if (mounted && payload.new) {
            setText((payload.new as { value: { text: string } }).value.text);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return text;
}

export function useAnnonce() {
  const [annonce, setAnnonce] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchSetting('annonce').then((data) => {
      if (mounted && data) setAnnonce((data as { text: string }).text);
    });

    const channel = supabase
      .channel('annonce_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'key=eq.annonce' },
        (payload) => {
          if (mounted && payload.new) {
            setAnnonce((payload.new as { value: { text: string } }).value.text);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return annonce;
}
