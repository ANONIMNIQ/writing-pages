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
  const wordCountPlaceholder = (
    <div className="flex space-x-0.5 h-4 items-end opacity-50">
      <div className="w-0.5 h-2 bg-foreground/50"></div>
      <div className="w-0.5 h-3 bg-foreground/50"></div>
      <div className="w-0.5 h-4 bg-foreground/50"></div>
      <div className="w-0.5 h-2 bg-foreground/50"></div>
    </div>
  );

  const countDisplay = isPublished ? (
    <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center text-xs font-medium text-foreground/70">
      {Math.floor(Math.random() * 2000) + 1}
    </div>
  ) : null;

  return (
    <div className="group flex items-center justify-between py-3 border-b border-border/10 hover:border-border/40 transition-all px-2 rounded-lg hover:bg-accent/5">
      <Link 
        to={`/editor/${draft.id}`} 
        className={cn(
          "flex-1 flex items-center space-x-4 transition-colors",
          isPublished ? "hover:text-primary" : "hover:text-primary"
        )}
      >
        {countDisplay}
        <span className={cn(
          "text-xl font-light font-serif",
          isPublished ? "text-foreground/80" : "text-foreground"
        )}>
          {draft.title || 'Untitled'}
        </span>
      </Link>
      
      <div className="flex items-center space-x-4">
        {wordCountPlaceholder}
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your writing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete?.(draft.id)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DraftListItem;