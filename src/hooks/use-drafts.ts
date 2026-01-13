import { useState, useEffect, useCallback } from 'react';
import { Draft } from '@/types/draft';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'writing_app_drafts';

const initialDrafts: Draft[] = [
  {
    id: uuidv4(),
    title: 'Start typing an idea title here...',
    content: 'Tell your story...',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
    status: 'draft',
  },
  {
    id: uuidv4(),
    title: 'Markdown Formatting',
    content: 'This is a test of markdown formatting.',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 7200000, // 2 hours ago
    status: 'draft',
  },
  {
    id: uuidv4(),
    title: 'How Evolution Really Works',
    content: 'A deep dive into evolutionary biology.',
    createdAt: Date.now() - 345600000, // 4 days ago
    updatedAt: Date.now() - 1800000, // 30 minutes ago
    status: 'published',
  },
];

const loadDrafts = (): Draft[] => {
  if (typeof window === 'undefined') return initialDrafts;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Draft[];
    }
  } catch (e) {
    console.error("Could not load drafts from localStorage", e);
  }
  return initialDrafts;
};

const saveDrafts = (drafts: Draft[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }
};

export const useDrafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>(loadDrafts);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  const getDraft = useCallback((id: string) => {
    return drafts.find(d => d.id === id);
  }, [drafts]);

  const createDraft = useCallback(() => {
    const newDraft: Draft = {
      id: uuidv4(),
      title: 'New Idea...',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
    };
    setDrafts(prev => [newDraft, ...prev]);
    return newDraft.id;
  }, []);

  const updateDraft = useCallback((id: string, updates: Partial<Omit<Draft, 'id' | 'createdAt'>>) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
    ));
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  return {
    drafts,
    getDraft,
    createDraft,
    updateDraft,
    deleteDraft,
  };
};