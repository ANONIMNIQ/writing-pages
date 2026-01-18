import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Note {
  id: string;
  text: string;
  highlightedText: string;
  createdAt: number;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  notes: Note[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  user_id: string;
}

export const useDrafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setDrafts(data as Draft[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const getDraft = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as Draft;
  }, []);

  const createDraft = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('drafts')
      .insert([{ user_id: user.id, notes: [] }])
      .select()
      .single();

    if (!error && data) {
      setDrafts(prev => [data as Draft, ...prev]);
      return data.id;
    }
    return null;
  }, []);

  const updateDraft = useCallback(async (id: string, updates: Partial<Draft>) => {
    const { error } = await supabase
      .from('drafts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setDrafts(prev => prev.map(d => 
        d.id === id ? { ...d, ...updates } : d
      ));
    }
  }, []);

  const deleteDraft = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);

    if (!error) {
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  }, []);

  return {
    drafts,
    loading,
    getDraft,
    createDraft,
    updateDraft,
    deleteDraft,
    refresh: fetchDrafts
  };
};