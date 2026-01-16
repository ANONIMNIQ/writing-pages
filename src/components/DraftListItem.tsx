import React from 'react';
import { Link } from 'react-router-dom';
import { Draft } from '@/hooks/use-drafts';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface DraftListItemProps {
  draft: Draft;
  isPublished?: boolean;
  onDelete?: (id: string) => void;
}

const DraftListItem: React.FC<DraftListItemProps> = ({ draft, isPublished = false, onDelete }) => {
  const countDisplay = isPublished ? (
    <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold">
      {Math.floor(Math.random() * 1000)}
    </div>
  ) : null;

  return (
    <div className="flex items-center justify-between p-6 border-2 border-border/50 rounded-2xl mb-4 bg-card hover:border-primary/50 transition-all shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        {countDisplay}
        <Link 
          to={`/editor/${draft.id}`} 
          className="flex-1 group"
        >
          <h3 className="text-3xl font-serif font-bold group-hover:text-primary transition-colors">
            {draft.title || 'Untitled Entry'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(draft.updated_at).toLocaleDateString()}
          </p>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild className="rounded-full">
          <Link to={`/editor/${draft.id}`}>Edit</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold px-6"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Entry
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                This will permanently delete "{draft.title || 'Untitled Entry'}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete?.(draft.id)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-8"
              >
                Yes, Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DraftListItem;