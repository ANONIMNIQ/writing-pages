export interface Draft {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'published';
}